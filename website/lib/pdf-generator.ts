import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PDFOptions } from "@/types/editor";

/**
 * Generate PDF from HTML content
 */
export async function generatePDF(
  content: string,
  fileName: string,
  options: PDFOptions = {
    pageSize: "a4",
    orientation: "portrait",
    margin: 15,
  }
): Promise<void> {
  // Create a hidden iframe for isolated rendering
  const iframe = document.createElement("iframe");
  iframe.style.visibility = "hidden";
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "210mm";
  iframe.style.height = "1px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) throw new Error("Could not access PDF rendering environment");

  // Inject styles that match the app's preview mode exactly
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          /* Base Styles */
          body { 
            margin: 0; 
            padding: 0; 
            background-color: white; 
            color: #111;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
          }
          #markdown-preview {
            padding: ${options.margin}mm;
            width: 210mm;
            box-sizing: border-box;
            background-color: white !important;
          }

          /* Hide UI elements not meant for PDF */
          .code-copy-button, 
          .code-block-header button,
          .copy-button { 
            display: none !important; 
          }

          /* Match Markdown CSS */
          h1, h2, h3, h4, h5, h6 { 
            color: #000; 
            margin-top: 1.5em; 
            margin-bottom: 0.5em;
            font-weight: 700;
            line-height: 1.25;
          }
          h1 { font-size: 2.25em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
          h2 { font-size: 1.75em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
          h3 { font-size: 1.5em; }
          
          p, ul, ol { margin-bottom: 1em; }
          li { margin-bottom: 0.25em; }
          
          blockquote { 
            border-left: 4px solid #dfe2e5; 
            padding: 0 1em; 
            color: #6a737d;
            margin: 0 0 1em 0;
          }

          /* Code Blocks - Styled to match current Metallic theme's preview */
          .code-block-container {
            margin: 1.5em 0;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            overflow: hidden;
            background-color: #f6f8fa;
          }
          .code-block-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
            background-color: #f6f8fa;
            border-bottom: 1px solid #e1e4e8;
          }
          .code-block-lang {
            font-size: 0.75rem;
            font-weight: 600;
            color: #586069;
            text-transform: uppercase;
          }
          pre { 
            margin: 0;
            padding: 1rem;
            overflow: auto;
            background-color: transparent;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 85%;
            line-height: 1.45;
          }
          code { 
            background-color: rgba(27,31,35,0.05);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: inherit;
          }
          pre code {
            background-color: transparent;
            padding: 0;
            display: block;
            white-space: pre;
          }

          /* Tables */
          table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
          th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
          th { background-color: #f6f8fa; font-weight: 600; }
          tr:nth-child(2n) { background-color: #f6f8fa; }

          img { max-width: 100%; height: auto; border-radius: 4px; }
          hr { height: 0.25em; background-color: #e1e4e8; border: 0; margin: 24px 0; }

          /* Code highlighting and line numbers */
          .code-line { display: flex; }
          .line-number {
            width: 3rem;
            min-width: 3rem;
            padding-right: 1rem;
            margin-right: 0.75rem;
            text-align: right;
            color: #959da5;
            border-right: 1px solid #e1e4e8;
            user-select: none;
          }
        </style>
      </head>
      <body>
        <div id="markdown-preview">${content}</div>
        <script>
          window.waitForImages = () => {
            const imgs = Array.from(document.images);
            return Promise.all(imgs.map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
              });
            }));
          };
        </script>
      </body>
    </html>
  `);
  doc.close();

  try {
    // Wait for content and images
    await new Promise((resolve) => {
      const check = async () => {
        if (
          iframe.contentWindow &&
          (iframe.contentWindow as any).waitForImages
        ) {
          await (iframe.contentWindow as any).waitForImages();
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });

    const preview = doc.getElementById("markdown-preview");
    if (!preview) throw new Error("Preview element not found");

    // Optimized for size: scale 1.5 instead of 2.0
    const canvas = await html2canvas(preview, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Use JPEG with 0.75 quality to drastically reduce file size from PNG
    const imgData = canvas.toDataURL("image/jpeg", 0.75);

    const imgWidth = options.pageSize === "a4" ? 210 : 216;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = options.pageSize === "a4" ? 297 : 279;

    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: "mm",
      format: options.pageSize,
      compress: true,
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Use JPEG for adding to PDF
    pdf.addImage(
      imgData,
      "JPEG",
      0,
      position,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pageHeight;
    }

    pdf.save(`${fileName}.pdf`);
  } catch (err) {
    console.error("Optimized PDF export failed:", err);
    throw err;
  } finally {
    document.body.removeChild(iframe);
  }
}

/**
 * Export content as HTML file
 */
export function exportAsHTML(content: string, fileName: string): void {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    code {
      background: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1em;
      margin-left: 0;
      color: #666;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
  `.trim();

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export content as Markdown file
 */
export function exportAsMarkdown(content: string, fileName: string): void {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
