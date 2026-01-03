import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

// Configure marked with GitHub Flavored Markdown and syntax highlighting
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

// Set marked options
marked.setOptions({
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
