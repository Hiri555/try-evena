/**
 * Reddit Comment Scraper - Content Script
 * Scrapes post data and comments from the current Reddit page.
 * Handles Reddit's new redesign (shreddit- web components).
 */

(() => {
  "use strict";

  /**
   * Scroll to load lazy-loaded comments.
   * Scrolls the page in increments and waits for new content.
   */
  async function loadAllComments() {
    const scrollStep = 800;
    const maxScrollAttempts = 30;
    let lastHeight = document.body.scrollHeight;

    for (let i = 0; i < maxScrollAttempts; i++) {
      window.scrollBy(0, scrollStep);
      await new Promise((r) => setTimeout(r, 400));

      // Click any "load more" / "continue thread" buttons
      const moreButtons = document.querySelectorAll(
        '[id*="more-comments"], [data-testid="comment-more"], button[slot="more-comments"]'
      );
      moreButtons.forEach((btn) => btn.click());

      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) break;
      lastHeight = newHeight;
    }

    // Scroll back to top
    window.scrollTo(0, 0);
  }

  /**
   * Extract post information from the page.
   */
  function scrapePost() {
    const post = { title: "", author: "", content: "", images: [] };

    // Post title
    post.title =
      getText('[data-testid="post-title"]') ||
      getText("shreddit-post [slot='title']") ||
      getText("h1") ||
      "";

    // Post author
    const authorEl =
      document.querySelector('[data-testid="post_author_link"]') ||
      document.querySelector("shreddit-post")?.getAttribute("author") ||
      document.querySelector('a[href*="/user/"]');

    if (typeof authorEl === "string") {
      post.author = authorEl;
    } else if (authorEl) {
      post.author = authorEl.textContent.trim();
    }

    // Post content
    post.content =
      getText('[data-testid="post-content"]') ||
      getText('[data-click-id="text"] .md') ||
      getText("shreddit-post [slot='text-body']") ||
      "";

    // Post images
    const imgSelectors = [
      '[data-testid="post-content"] img',
      'shreddit-post img[src*="redd.it"]',
      'shreddit-post img[src*="reddit"]',
      '[data-click-id="body"] img',
      'a[href*="i.redd.it"] img',
    ];
    const seenSrc = new Set();
    for (const sel of imgSelectors) {
      document.querySelectorAll(sel).forEach((img) => {
        const src = img.src || img.getAttribute("src");
        if (src && !seenSrc.has(src) && !src.includes("icon") && !src.includes("avatar")) {
          seenSrc.add(src);
          post.images.push(src);
        }
      });
    }

    return post;
  }

  /**
   * Extract all comments from the page, including nested replies.
   */
  function scrapeComments() {
    const seen = new Set();

    // Try new Reddit (shreddit) comments first
    const shredditComments = document.querySelectorAll("shreddit-comment");
    if (shredditComments.length > 0) {
      return scrapeShredditComments(shredditComments, seen);
    }

    // Fallback: try standard Reddit redesign
    const commentNodes = document.querySelectorAll(
      '[data-testid="comment"], .Comment, [class*="comment"]'
    );
    if (commentNodes.length > 0) {
      return scrapeRedesignComments(commentNodes, seen);
    }

    // Fallback: old Reddit
    return scrapeOldRedditComments(seen);
  }

  /**
   * Scrape comments from shreddit web component structure.
   */
  function scrapeShredditComments(elements, seen) {
    const comments = [];

    // Build top-level only; replies are nested inside each shreddit-comment
    elements.forEach((el) => {
      // Only process top-level (depth 0) here
      const depth = parseInt(el.getAttribute("depth") || "0", 10);
      if (depth !== 0) return;

      const comment = extractShredditComment(el, seen);
      if (comment) comments.push(comment);
    });

    return comments;
  }

  function extractShredditComment(el, seen) {
    const thingId = el.getAttribute("thingid") || el.id || "";
    if (seen.has(thingId) && thingId) return null;
    if (thingId) seen.add(thingId);

    const author = el.getAttribute("author") || "";
    const score = parseScore(el.getAttribute("score") || "0");
    const textEl = el.querySelector('[slot="comment"] p, [slot="comment"]');
    const text = textEl ? textEl.textContent.trim() : "";

    if (!text && !author) return null;

    // Get nested replies
    const replies = [];
    const childComments = el.querySelectorAll(":scope > shreddit-comment");
    childComments.forEach((child) => {
      const reply = extractShredditComment(child, seen);
      if (reply) replies.push(reply);
    });

    return { author: `u/${author}`, score, text, replies };
  }

  /**
   * Scrape comments from Reddit redesign.
   */
  function scrapeRedesignComments(elements, seen) {
    const comments = [];

    elements.forEach((el) => {
      const id = el.id || el.getAttribute("data-fullname") || "";
      if (seen.has(id) && id) return;
      if (id) seen.add(id);

      const authorEl = el.querySelector('a[href*="/user/"]');
      const author = authorEl ? authorEl.textContent.trim() : "unknown";

      const scoreEl = el.querySelector('[class*="score"], [id*="score"]');
      const score = scoreEl ? parseScore(scoreEl.textContent) : 0;

      const textEl = el.querySelector(
        '[data-testid="comment"] .md, [class*="RichTextJSON"], p'
      );
      const text = textEl ? textEl.textContent.trim() : "";

      if (!text) return;

      comments.push({ author, score, text, replies: [] });
    });

    return comments;
  }

  /**
   * Scrape comments from old Reddit.
   */
  function scrapeOldRedditComments(seen) {
    const comments = [];
    const entries = document.querySelectorAll(".comment .entry");

    entries.forEach((entry) => {
      const parent = entry.closest(".comment");
      const id = parent ? parent.getAttribute("data-fullname") || "" : "";
      if (seen.has(id) && id) return;
      if (id) seen.add(id);

      const authorEl = entry.querySelector(".author");
      const author = authorEl ? authorEl.textContent.trim() : "unknown";

      const scoreEl = entry.querySelector(".score.unvoted, .score");
      const score = scoreEl ? parseScore(scoreEl.textContent) : 0;

      const textEl = entry.querySelector(".md");
      const text = textEl ? textEl.textContent.trim() : "";

      if (!text) return;

      comments.push({ author, score, text, replies: [] });
    });

    return comments;
  }

  /* ---- Helpers ---- */

  function getText(selector) {
    const el = document.querySelector(selector);
    return el ? el.textContent.trim() : "";
  }

  function parseScore(raw) {
    if (!raw) return 0;
    const cleaned = raw.replace(/[^0-9.\-k]/gi, "").toLowerCase();
    if (cleaned.includes("k")) {
      return Math.round(parseFloat(cleaned) * 1000);
    }
    return parseInt(cleaned, 10) || 0;
  }

  /* ---- Message Listener ---- */

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "scrape") {
      (async () => {
        try {
          await loadAllComments();
          const post = scrapePost();
          const comments = scrapeComments();
          sendResponse({ success: true, data: { post, comments } });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      })();
      // Return true to keep the message channel open for async response
      return true;
    }
  });
})();
