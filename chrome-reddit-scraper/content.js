/**
 * Reddit & Quora Scraper - Content Script
 * Scrapes post data and comments/answers from Reddit and Quora pages.
 */

(() => {
  "use strict";

  /**
   * Detect which site we're on.
   */
  function detectSite() {
    const host = window.location.hostname;
    if (host.includes("reddit.com")) return "reddit";
    if (host.includes("quora.com")) return "quora";
    return "unknown";
  }

  /**
   * Scroll to load lazy-loaded content.
   */
  async function loadAllComments() {
    const scrollStep = 800;
    const maxScrollAttempts = 30;
    let lastHeight = document.body.scrollHeight;

    for (let i = 0; i < maxScrollAttempts; i++) {
      window.scrollBy(0, scrollStep);
      await new Promise((r) => setTimeout(r, 400));

      const site = detectSite();

      if (site === "reddit") {
        const moreButtons = document.querySelectorAll(
          '[id*="more-comments"], [data-testid="comment-more"], button[slot="more-comments"]'
        );
        moreButtons.forEach((btn) => btn.click());
      }

      if (site === "quora") {
        // Click "More answers" or "Continue reading" buttons
        const moreButtons = document.querySelectorAll(
          'button[class*="more"], [class*="ExpandAnswer"], [class*="ContinueReading"]'
        );
        moreButtons.forEach((btn) => btn.click());
      }

      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) break;
      lastHeight = newHeight;
    }

    window.scrollTo(0, 0);
  }

  /* ====================
     REDDIT SCRAPING
     ==================== */

  function scrapeRedditPost() {
    const post = { title: "", author: "", content: "", images: [] };

    post.title =
      getText('[data-testid="post-title"]') ||
      getText("shreddit-post [slot='title']") ||
      getText("h1") ||
      "";

    const authorEl =
      document.querySelector('[data-testid="post_author_link"]') ||
      document.querySelector("shreddit-post")?.getAttribute("author") ||
      document.querySelector('a[href*="/user/"]');

    if (typeof authorEl === "string") {
      post.author = authorEl;
    } else if (authorEl) {
      post.author = authorEl.textContent.trim();
    }

    post.content =
      getText('[data-testid="post-content"]') ||
      getText('[data-click-id="text"] .md') ||
      getText("shreddit-post [slot='text-body']") ||
      "";

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

  function scrapeRedditComments() {
    const seen = new Set();

    const shredditComments = document.querySelectorAll("shreddit-comment");
    if (shredditComments.length > 0) {
      return scrapeShredditComments(shredditComments, seen);
    }

    const commentNodes = document.querySelectorAll(
      '[data-testid="comment"], .Comment, [class*="comment"]'
    );
    if (commentNodes.length > 0) {
      return scrapeRedesignComments(commentNodes, seen);
    }

    return scrapeOldRedditComments(seen);
  }

  function scrapeShredditComments(elements, seen) {
    const comments = [];
    elements.forEach((el) => {
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

    const replies = [];
    const childComments = el.querySelectorAll(":scope > shreddit-comment");
    childComments.forEach((child) => {
      const reply = extractShredditComment(child, seen);
      if (reply) replies.push(reply);
    });

    return { author: `u/${author}`, score, text, replies };
  }

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

  /* ====================
     QUORA SCRAPING
     ==================== */

  function scrapeQuoraPost() {
    const post = { title: "", author: "", content: "", images: [] };

    // Question title - Quora uses various selectors
    post.title =
      getText('[class*="QuestionTitle"], [class*="question_title"]') ||
      getText('h1') ||
      getText('.q-text[class*="Title"]') ||
      getText('div[id="mainContent"] span.q-box') ||
      "";

    // Question details/context
    post.content =
      getText('[class*="QuestionDetail"]') ||
      getText('[class*="question_details"]') ||
      "";

    // Question author (often not shown on Quora questions)
    const authorEl = document.querySelector(
      '[class*="QuestionAuthor"] a, [class*="question_author"] a'
    );
    post.author = authorEl ? authorEl.textContent.trim() : "";

    // Images in the question
    const seenSrc = new Set();
    document.querySelectorAll('[class*="QuestionDetail"] img, [class*="question_details"] img').forEach((img) => {
      const src = img.src || img.getAttribute("src");
      if (src && !seenSrc.has(src) && !src.includes("profile") && !src.includes("avatar")) {
        seenSrc.add(src);
        post.images.push(src);
      }
    });

    return post;
  }

  function scrapeQuoraComments() {
    const answers = [];
    const seen = new Set();

    // Quora answers are in DOM elements with various class patterns
    // Try multiple selectors for different Quora layouts
    const answerSelectors = [
      '[class*="AnswerBase"]',
      '[class*="Answer--"]',
      '[class*="dom_annotate_question_answer"]',
      '.Answer',
      '[id*="answer"]',
    ];

    let answerElements = [];
    for (const sel of answerSelectors) {
      answerElements = document.querySelectorAll(sel);
      if (answerElements.length > 0) break;
    }

    // Fallback: look for answer-like content blocks
    if (answerElements.length === 0) {
      answerElements = document.querySelectorAll(
        'div[class*="spacing_log_answer"], div[class*="ContentWrapper"]'
      );
    }

    answerElements.forEach((el, idx) => {
      const elId = el.id || `quora-answer-${idx}`;
      if (seen.has(elId)) return;
      seen.add(elId);

      // Find author
      let author = "";
      const authorEl = el.querySelector(
        'a[class*="user"], a[href*="/profile/"], [class*="AuthorName"], [class*="author_name"]'
      );
      if (authorEl) {
        author = authorEl.textContent.trim();
      }

      // Find answer text - get all paragraph/span content
      let text = "";
      const textEls = el.querySelectorAll(
        '[class*="AnswerContent"] span, [class*="answer_content"] p, .q-text span.q-box, p.q-text'
      );
      if (textEls.length > 0) {
        const parts = [];
        textEls.forEach((t) => {
          const content = t.textContent.trim();
          if (content && !parts.includes(content)) {
            parts.push(content);
          }
        });
        text = parts.join(" ");
      }

      // Fallback: grab all visible text from the answer
      if (!text) {
        const allText = el.querySelectorAll('span.q-box, p, [class*="content"] span');
        const parts = [];
        allText.forEach((t) => {
          const content = t.textContent.trim();
          if (content.length > 20 && !parts.includes(content)) {
            parts.push(content);
          }
        });
        text = parts.join(" ");
      }

      if (!text && !author) return;

      // Find upvotes / score
      let score = 0;
      const upvoteEl = el.querySelector(
        '[class*="VoterCount"], [class*="voter_count"], button[class*="upvote"] span, [class*="Upvote"] span'
      );
      if (upvoteEl) {
        score = parseScore(upvoteEl.textContent);
      }

      // Collect images from the answer
      const images = [];
      el.querySelectorAll('img[src*="qph"], img[class*="answer_image"]').forEach((img) => {
        const src = img.src || img.getAttribute("src");
        if (src && !src.includes("profile") && !src.includes("avatar")) {
          images.push(src);
        }
      });

      // Get comments on this answer (Quora allows comments on answers)
      const replies = [];
      const commentEls = el.querySelectorAll(
        '[class*="AnswerComment"], [class*="answer_comment"], [class*="Comment"]'
      );
      commentEls.forEach((commentEl) => {
        const commentAuthorEl = commentEl.querySelector(
          'a[class*="user"], a[href*="/profile/"]'
        );
        const commentAuthor = commentAuthorEl ? commentAuthorEl.textContent.trim() : "";
        const commentTextEl = commentEl.querySelector('span, p');
        const commentText = commentTextEl ? commentTextEl.textContent.trim() : "";
        if (commentText) {
          replies.push({ author: commentAuthor, score: 0, text: commentText, replies: [] });
        }
      });

      answers.push({
        author,
        score,
        text: text.substring(0, 5000), // Limit very long answers
        replies,
      });
    });

    return answers;
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
          const site = detectSite();
          await loadAllComments();

          let post, comments;

          if (site === "quora") {
            post = scrapeQuoraPost();
            comments = scrapeQuoraComments();
          } else {
            post = scrapeRedditPost();
            comments = scrapeRedditComments();
          }

          sendResponse({ success: true, data: { post, comments, site } });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      })();
      return true;
    }

    if (request.action === "detectSite") {
      sendResponse({ site: detectSite() });
      return false;
    }
  });
})();
