'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGeneratorService {
  /**
   * Automatically download an HTML element as a clean PDF file locally into the user's Downloads folder.
   */
  static async exportElementToPDF(elementId: string, filename: string): Promise<boolean> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found for PDF export`);
      return false;
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // Ensure all images are loaded first
    const images = Array.from(element.getElementsByTagName('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // Try Primary Canvas Engine (html2canvas with isolated styles)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        ignoreElements: (el) => {
          return el.classList.contains('no-print');
        },
        onclone: (clonedDoc) => {
          // Clean up cloned document to avoid Tailwind v4 oklch or unsupported CSS parsing issues
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.margin = '0 auto';
            clonedElement.style.padding = '24px';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.border = 'none';
            clonedElement.style.maxWidth = '800px';
            clonedElement.style.backgroundColor = '#ffffff';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pdfHeight;
      }

      this.triggerBlobDownload(pdf, cleanFilename);
      return true;
    } catch (canvasErr) {
      console.warn('html2canvas render had an issue, using SVG foreignObject canvas engine:', canvasErr);
      
      // Secondary Canvas Engine: SVG foreignObject capture
      try {
        const svgCanvas = await this.renderElementViaSVG(element);
        if (svgCanvas) {
          const imgData = svgCanvas.toDataURL('image/png', 1.0);
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pdfWidth;
          const imgHeight = (svgCanvas.height * imgWidth) / svgCanvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
          this.triggerBlobDownload(pdf, cleanFilename);
          return true;
        }
      } catch (svgErr) {
        console.error('SVG canvas engine error:', svgErr);
      }

      // Fallback: Generate structured vector PDF directly
      return this.generateDirectVectorPDF(element, cleanFilename);
    }
  }

  /**
   * Helper: Triggers automatic browser file download using a Blob URL and simulated click
   */
  private static triggerBlobDownload(pdf: jsPDF, filename: string): void {
    try {
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(blobUrl);
      }, 500);
    } catch (e) {
      // Fallback to standard save method
      pdf.save(filename);
    }
  }

  /**
   * Render HTML Element via SVG ForeignObject to Canvas
   */
  private static async renderElementViaSVG(element: HTMLElement): Promise<HTMLCanvasElement | null> {
    const width = element.offsetWidth || 800;
    const height = element.offsetHeight || 1100;

    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Extract styles
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    const htmlContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff; color:#17202A; font-family:system-ui,sans-serif; padding:16px;">
            ${styles}
            ${element.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const svgBlob = new Blob([htmlContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  /**
   * Direct vector PDF fallback generator in case rasterization fails
   */
  private static generateDirectVectorPDF(element: HTMLElement, filename: string): boolean {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.setFillColor(8, 43, 82); // #082B52 Navy
      pdf.rect(0, 0, 210, 24, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VACANYI BUILDING CONSTRUCTION & PROJECT', 14, 12);

      pdf.setTextColor(213, 161, 30); // #D5A11E Gold
      pdf.setFontSize(8);
      pdf.text('Precision Building, Structural Engineering & Turnkey Projects', 14, 18);

      pdf.setTextColor(23, 32, 42); // #17202A Ink
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const textLines = element.innerText.split('\n').filter((l) => l.trim().length > 0);
      let y = 34;

      for (const line of textLines) {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }

        if (
          line.startsWith('Quote No') ||
          line.startsWith('Invoice #') ||
          line.startsWith('TOTAL') ||
          line.startsWith('CLIENT') ||
          line.startsWith('PROJECT')
        ) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(line, 14, y);
          pdf.setFont('helvetica', 'normal');
        } else {
          pdf.text(line, 14, y);
        }
        y += 6;
      }

      this.triggerBlobDownload(pdf, filename);
      return true;
    } catch (e) {
      console.error('Direct vector PDF generation error:', e);
      return false;
    }
  }

  /**
   * Print an element using an isolated high-fidelity iframe with exact brand CSS & colors
   */
  static printElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) {
      window.print();
      return;
    }

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all active styles and links from head
    const styleSheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Vacanyi Document</title>
          ${styleSheets}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              background: #ffffff !important;
              color: #17202A !important;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .pdf-document-sheet {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          <div class="pdf-document-sheet">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Wait for images in iframe to load
    const images = Array.from(doc.images);
    Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    ).then(() => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('Print failed:', e);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }
      }, 300);
    });
  }
}
