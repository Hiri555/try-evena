/**
 * Reddit Comment Scraper - Popup Script
 * Manages UI interactions, triggers scraping, and handles exports.
 */

(() => {
  "use strict";

  let scrapedData = null; // { post: {...}, comments: [...] }

  /* ---- DOM References ---- */
  const scrapeBtn = document.getElementById("scrape-btn");
  const loadingSpinner = document.getElementById("loading-spinner");
  const statusBar = document.getElementById("status-bar");
  const statusText = document.getElementById("status-text");
  const commentsPanel = document.getElementById("comments-panel");
  const insightsPanel = document.getElementById("insights-panel");
  const commentsList = document.getElementById("comments-list");
  const postInfo = document.getElementById("post-info");
  const postTitle = document.getElementById("post-title");
  const postAuthor = document.getElementById("post-author");
  const postContent = document.getElementById("post-content");
  const postImages = document.getElementById("post-images");

  // Insight elements
  const totalCommentsEl = document.getElementById("total-comments");
  const avgLengthEl = document.getElementById("avg-length");
  const totalScoreEl = document.getElementById("total-score");
  const avgScoreEl = document.getElementById("avg-score");
  const topCommentersList = document.getElementById("top-commenters-list");

  // Export buttons
  const copyBtn = document.getElementById("copy-btn");
  const csvBtn = document.getElementById("csv-btn");
  const jsonBtn = document.getElementById("json-btn");

  /* ---- Tab Switching ---- */
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.dataset.content;
      commentsPanel.classList.toggle("hidden", tab !== "comments");
      commentsPanel.classList.toggle("active", tab === "comments");
      insightsPanel.classList.toggle("hidden", tab !== "insights");
      insightsPanel.classList.toggle("active", tab === "insights");
    });
  });

  /* ---- Scrape Action ---- */
  scrapeBtn.addEventListener("click", async () => {
    setLoading(true);
    showStatus("Scraping comments...", false);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url || !tab.url.includes("reddit.com")) {
        showStatus("Please navigate to a Reddit post first.", true);
        setLoading(false);
        return;
      }

      // Inject content script if not already injected
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
      } catch (_) {
        // Script may already be injected; ignore error
      }

      // Send scrape message
      chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (response) => {
        setLoading(false);

        if (chrome.runtime.lastError) {
          showStatus("Error: Could not connect to page. Refresh and try again.", true);
          return;
        }

        if (!response || !response.success) {
          showStatus(`Error: ${response?.error || "Unknown error"}`, true);
          return;
        }

        scrapedData = response.data;
        const count = flattenComments(scrapedData.comments).length;
        showStatus(`Scraped ${count} comments!`, false);
        renderPost(scrapedData.post);
        renderComments(scrapedData.comments);
        renderInsights(scrapedData.comments);
      });
    } catch (err) {
      setLoading(false);
      showStatus(`Error: ${err.message}`, true);
    }
  });

  /* ---- Rendering ---- */

  function renderPost(post) {
    if (!post || (!post.title && !post.author)) {
      postInfo.classList.add("hidden");
      return;
    }
    postInfo.classList.remove("hidden");
    postTitle.textContent = post.title;
    postAuthor.textContent = post.author;
    postContent.textContent = post.content || "";

    postImages.innerHTML = "";
    (post.images || []).forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Post image";
      postImages.appendChild(img);
    });
  }

  function renderComments(comments) {
    commentsList.innerHTML = "";

    if (!comments || comments.length === 0) {
      commentsList.innerHTML =
        '<div class="empty-state"><p>No comments found on this page.</p></div>';
      return;
    }

    comments.forEach((comment, idx) => {
      commentsList.appendChild(createCommentCard(comment, idx + 1));
    });
  }

  function createCommentCard(comment, number) {
    const card = document.createElement("div");
    card.className = "comment-card";

    const header = document.createElement("div");
    header.className = "comment-header";

    const numSpan = document.createElement("span");
    numSpan.className = "comment-number";
    numSpan.textContent = `Comment ${number}`;

    const authorSpan = document.createElement("span");
    authorSpan.className = "comment-author";
    authorSpan.textContent = `· ${comment.author}`;

    const scoreSpan = document.createElement("span");
    scoreSpan.className = "comment-score";
    scoreSpan.textContent = `⬆ ${comment.score} points`;

    header.append(numSpan, authorSpan, scoreSpan);

    const textP = document.createElement("p");
    textP.className = "comment-text";
    textP.textContent = comment.text;

    card.append(header, textP);

    // Render nested replies
    if (comment.replies && comment.replies.length > 0) {
      const repliesDiv = document.createElement("div");
      repliesDiv.className = "comment-replies";
      comment.replies.forEach((reply, rIdx) => {
        repliesDiv.appendChild(createCommentCard(reply, `${number}.${rIdx + 1}`));
      });
      card.appendChild(repliesDiv);
    }

    return card;
  }

  function renderInsights(comments) {
    const flat = flattenComments(comments);
    const total = flat.length;
    const totalScore = flat.reduce((s, c) => s + (c.score || 0), 0);
    const totalLength = flat.reduce((s, c) => s + (c.text || "").length, 0);

    totalCommentsEl.textContent = total;
    avgLengthEl.textContent = total > 0 ? Math.round(totalLength / total) : 0;
    totalScoreEl.textContent = totalScore;
    avgScoreEl.textContent = total > 0 ? Math.round(totalScore / total) : 0;

    // Top commenters
    const authorMap = {};
    flat.forEach((c) => {
      const a = c.author || "unknown";
      authorMap[a] = (authorMap[a] || 0) + 1;
    });

    const sorted = Object.entries(authorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    topCommentersList.innerHTML = "";
    sorted.forEach(([author, count]) => {
      const li = document.createElement("li");
      li.innerHTML = `${escapeHtml(author)} <span>(${count} comments)</span>`;
      topCommentersList.appendChild(li);
    });
  }

  /* ---- Export Functions ---- */

  copyBtn.addEventListener("click", () => {
    if (!scrapedData) return showStatus("Nothing to copy. Scrape first!", true);
    const flat = flattenComments(scrapedData.comments);
    const text = flat
      .map((c, i) => `[${i + 1}] ${c.author} (${c.score} pts): ${c.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      showStatus("Copied to clipboard!", false);
    });
  });

  csvBtn.addEventListener("click", () => {
    if (!scrapedData) return showStatus("Nothing to export. Scrape first!", true);
    const flat = flattenComments(scrapedData.comments);
    const header = "Author,Score,Text";
    const rows = flat.map(
      (c) => `"${csvEscape(c.author)}","${c.score}","${csvEscape(c.text)}"`
    );
    const csv = [header, ...rows].join("\n");
    downloadFile(csv, "reddit_comments.csv", "text/csv");
    showStatus("CSV downloaded!", false);
  });

  jsonBtn.addEventListener("click", () => {
    if (!scrapedData) return showStatus("Nothing to export. Scrape first!", true);
    const json = JSON.stringify(scrapedData, null, 2);
    downloadFile(json, "reddit_comments.json", "application/json");
    showStatus("JSON downloaded!", false);
  });

  /* ---- Helpers ---- */

  function flattenComments(comments) {
    const result = [];
    function walk(list) {
      for (const c of list) {
        result.push(c);
        if (c.replies && c.replies.length) walk(c.replies);
      }
    }
    walk(comments || []);
    return result;
  }

  function setLoading(loading) {
    scrapeBtn.disabled = loading;
    loadingSpinner.classList.toggle("hidden", !loading);
  }

  function showStatus(message, isError) {
    statusBar.classList.remove("hidden", "error");
    if (isError) statusBar.classList.add("error");
    statusText.textContent = message;
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvEscape(str) {
    return (str || "").replace(/"/g, '""').replace(/\n/g, " ");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
