import { Client, Quote, Invoice, MilestoneReceipt, Project, CompanySettings } from '../types';
import { formatZAR, formatDate, normalizeWhatsAppNumber } from '../utils/formatters';

export class WhatsAppShareService {
  /**
   * Build WhatsApp URL with phone number and pre-filled text
   */
  static buildWhatsAppUrl(phone: string, message: string): string {
    const normalizedPhone = normalizeWhatsAppNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    if (normalizedPhone) {
      return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
    }
    return `https://wa.me/?text=${encodedMessage}`;
  }

  /**
   * 1-Tap WhatsApp Quotation message template
   */
  static createQuoteMessage(quote: Quote, client: Client, settings: CompanySettings): string {
    const clientGreeting = client.companyName ? `Dear ${client.name} (${client.companyName})` : `Dear ${client.name}`;
    
    return `*${settings.shortName.toUpperCase()} — PROJECT QUOTATION*
📋 *Quote Ref:* ${quote.quoteNumber}
🏗️ *Project:* ${quote.title}
📍 *Site Location:* ${quote.siteAddress || 'As per specifications'}
📅 *Date Issued:* ${formatDate(quote.issueDate)}
⏳ *Validity:* Valid until ${formatDate(quote.expiryDate)}

💰 *TOTAL ESTIMATE:* *${formatZAR(quote.totalAmount)}* (incl. 15% VAT)

${quote.scopeOfWork ? `*Scope of Work Summary:*\n${quote.scopeOfWork}\n\n` : ''}*Milestone Schedule:*\n${quote.paymentScheduleTerms || 'Standard 4-phase milestone drawdowns apply.'}

📞 *Direct Contact:* ${settings.phone}
✉️ *Email:* ${settings.email}
🌐 *Portal:* ${settings.website}

_Thank you for choosing ${settings.companyName}. We look forward to delivering excellence on your project._`;
  }

  /**
   * 1-Tap WhatsApp Tax Invoice & Drawdown message template
   */
  static createInvoiceMessage(invoice: Invoice, client: Client, settings: CompanySettings): string {
    const clientGreeting = client.companyName ? `Dear ${client.name} (${client.companyName})` : `Dear ${client.name}`;
    
    return `*${settings.shortName.toUpperCase()} — TAX INVOICE / PROGRESS DRAW*
${clientGreeting},

Please find the details for your latest construction progress claim:

📄 *Invoice No:* ${invoice.invoiceNumber}
🏗️ *Description:* ${invoice.title}
📅 *Issue Date:* ${formatDate(invoice.issueDate)}
⚠️ *Payment Due:* ${formatDate(invoice.dueDate)}

💵 *Total Amount:* ${formatZAR(invoice.totalAmount)}
💳 *Amount Paid to Date:* ${formatZAR(invoice.amountPaid)}
🔴 *BALANCE DUE:* *${formatZAR(invoice.balanceDue)}*

🏦 *BANKING DETAILS FOR EFT:*
• *Bank:* ${settings.bankName}
• *Account Name:* ${settings.accountName}
• *Account Number:* ${settings.accountNumber}
• *Branch Code:* ${settings.branchCode}
• *Reference:* *${invoice.paymentReference || invoice.invoiceNumber}*

Kindly send your proof of payment via WhatsApp or to *${settings.email}*.

_NHBRC Registration: ${settings.nhbrcNumber}_
_${settings.companyName}_`;
  }

  /**
   * 1-Tap WhatsApp Milestone Payment Receipt message template
   */
  static createReceiptMessage(receipt: MilestoneReceipt, client: Client, settings: CompanySettings): string {
    const clientGreeting = client.companyName ? `Dear ${client.name} (${client.companyName})` : `Dear ${client.name}`;
    
    return `*${settings.shortName.toUpperCase()} — OFFICIAL PAYMENT RECEIPT*
${clientGreeting},

We hereby acknowledge and confirm receipt of your construction milestone payment with thanks! ✅

🧾 *Receipt No:* ${receipt.receiptNumber}
📅 *Payment Date:* ${formatDate(receipt.paymentDate)}
💰 *AMOUNT RECEIVED:* *${formatZAR(receipt.amountPaid)}*
💳 *Payment Method:* ${receipt.paymentMethod}
🏷️ *Transaction Ref:* ${receipt.bankReference || '-'}
🏗️ *Milestone Stage:* ${receipt.milestoneDescription}
📊 *Remaining Project Balance:* ${formatZAR(receipt.remainingProjectBalance)}

${receipt.notes ? `*Notes:* ${receipt.notes}\n` : ''}
Your official stamped milestone receipt PDF has been archived in your project file.

📞 *Queries:* ${settings.phone} | ${settings.email}
_${settings.companyName}_`;
  }

  /**
   * 1-Tap WhatsApp Milestone Progress Update
   */
  static createMilestoneUpdateMessage(project: Project, client: Client, settings: CompanySettings): string {
    return `*${settings.shortName.toUpperCase()} — SITE PROGRESS UPDATE*
Dear ${client.name},

Here is the current milestone status for your project:
🏗️ *Project:* ${project.title} (${project.projectCode})
📍 *Site:* ${project.siteAddress}
📈 *Overall Completion:* *${project.progressPercentage}%*
👷 *Site Foreman:* ${project.siteForeman || 'Vacanyi Site Team'}

_We take pride in delivering superior structural workmanship adhering strictly to SANS 10400 & NHBRC standards._

${settings.phone} | ${settings.website}`;
  }

  /**
   * 1-Tap WhatsApp Client Account Statement
   */
  static createStatementMessage(client: Client, totalInvoiced: number, totalPaid: number, balanceDue: number, settings: CompanySettings): string {
    return `*${settings.shortName.toUpperCase()} — CLIENT STATEMENT SUMMARY*
Dear ${client.name}${client.companyName ? ` (${client.companyName})` : ''},

Here is your current account statement with ${settings.companyName}:

📄 *Total Billed:* ${formatZAR(totalInvoiced)}
💰 *Total Paid:* ${formatZAR(totalPaid)}
🔴 *Current Outstanding Balance:* *${formatZAR(balanceDue)}*

🏦 *EFT Payment Details:*
${settings.bankName} | Acc: ${settings.accountNumber} | Branch: ${settings.branchCode}
Ref: ${client.name.replace(/\s+/g, '').slice(0, 10).toUpperCase()}

Thank you for your ongoing partnership!`;
  }

  /**
   * Open WhatsApp directly in new tab or native app
   */
  static openWhatsApp(phone: string, message: string): void {
    const url = this.buildWhatsAppUrl(phone, message);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Native device share if supported (Mobile/Tablet), fallback to WhatsApp
   */
  static async nativeShareOrWhatsApp(phone: string, title: string, text: string): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
        });
        return;
      } catch {
        // Fallback to WhatsApp
      }
    }
    this.openWhatsApp(phone, text);
  }
}
