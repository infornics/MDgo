import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

// Custom renderer for code blocks
const renderer = {
  code({ text, lang }: { text: string; lang?: string }): string {
    const language = lang || "plaintext";
    const hlHighlight = hljs.getLanguage(language) ? language : "plaintext";
    const highlighted = hljs.highlight(text, { language: hlHighlight }).value;

    // Wrap lines for numbering
    const lines = highlighted
      .split("\n")
      .map((line, i) => {
        // Don't add a line for the very last empty line if it exists
        if (i === highlighted.split("\n").length - 1 && line === "") return "";
        return `<div class="code-line"><span class="line-number">${
          i + 1
        }</span><span class="line-content">${line}</span></div>`;
      })
      .join("");

    return `
      <div class="code-block-container">
        <div class="code-block-header">
          <span class="code-block-lang">${language}</span>
          <button class="code-copy-button" data-code="${encodeURIComponent(
            text
          )}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          </button>
        </div>
        <pre><code class="hljs language-${language}">${lines}</code></pre>
      </div>
    `;
  },
};

// Configure marked with custom renderer and GFM
marked.use({
  renderer,
  gfm: true,
  breaks: true,
});

/**
 * Parse markdown to HTML
 */
export function parseMarkdown(markdown: string): string {
  return marked.parse(markdown) as string;
}

/**
 * Sanitize markdown content
 */
export function sanitizeMarkdown(content: string): string {
  return content.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
}

/**
 * Get plain text from markdown (strip formatting)
 */
export function getPlainText(markdown: string): string {
  const html = parseMarkdown(markdown);
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

/**
 * Count words in markdown
 */
export function countWords(markdown: string): number {
  const text = getPlainText(markdown);
  return text.trim().split(/\s+/).length;
}

/**
 * Estimate reading time (assuming 200 words per minute)
 */
export function estimateReadingTime(markdown: string): number {
  const wordCount = countWords(markdown);
  return Math.ceil(wordCount / 200);
}
