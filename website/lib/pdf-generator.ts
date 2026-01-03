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
  // Create a temporary container for the HTML content
  const container = document.createElement("div");
  container.innerHTML = content;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = "210mm"; // A4 width
  container.style.padding = `${options.margin}mm`;
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "12pt";
  container.style.lineHeight = "1.6";

  document.body.appendChild(container);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Calculate PDF dimensions
    const imgWidth = options.pageSize === "a4" ? 210 : 216; // mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = options.pageSize === "a4" ? 297 : 279; // mm

    // Create PDF
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: "mm",
      format: options.pageSize,
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF (handle multiple pages)
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(`${fileName}.pdf`);
  } finally {
    // Clean up
    document.body.removeChild(container);
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
