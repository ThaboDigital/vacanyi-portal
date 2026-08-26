import { Client, Quote, Invoice, MilestoneReceipt, CompanySettings } from '../types';
import { formatZAR, formatDate } from '../utils/formatters';

export class EmailShareService {
  /**
   * Build mailto link
   */
  static buildMailtoUrl(to: string, subject: string, body: string): string {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
  }

  /**
   * Open default email client
   */
  static openEmail(to: string, subject: string, body: string): void {
    const url = this.buildMailtoUrl(to, subject, body);
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  }

  /**
   * 1-Tap Email Quotation template
   */
  static sendQuoteEmail(quote: Quote, client: Client, settings: CompanySettings): void {
    const subject = `Quotation ${quote.quoteNumber} - ${quote.title} | ${settings.shortName}`;
    const body = `Dear ${client.name},

Thank you for the opportunity to submit our proposal for ${quote.title}.

QUOTATION SUMMARY:
• Quote Reference: ${quote.quoteNumber}
• Site Address: ${quote.siteAddress}
• Date Issued: ${formatDate(quote.issueDate)}
• Expiry Date: ${formatDate(quote.expiryDate)}
• Total Amount: ${formatZAR(quote.totalAmount)} (incl. 15% VAT)

${quote.scopeOfWork ? `SCOPE OF WORK:\n${quote.scopeOfWork}\n\n` : ''}
PAYMENT MILESTONE SCHEDULE:
${quote.paymentScheduleTerms || 'Standard progress milestone drawdowns.'}

Please review the attached formal quotation. To accept this proposal and secure your project schedule, kindly reply with your written confirmation or signed acceptance.

Kind regards,

${settings.companyName}
Phone: ${settings.phone}
Email: ${settings.email}
Website: ${settings.website}
NHBRC Registration: ${settings.nhbrcNumber}`;

    this.openEmail(client.email || '', subject, body);
  }

  /**
   * 1-Tap Email Invoice template
   */
  static sendInvoiceEmail(invoice: Invoice, client: Client, settings: CompanySettings): void {
    const subject = `Tax Invoice ${invoice.invoiceNumber} - ${invoice.title} | ${settings.shortName}`;
    const body = `Dear ${client.name},

Please find detailed below your Tax Invoice for construction works completed:

INVOICE SUMMARY:
• Invoice Number: ${invoice.invoiceNumber}
• Description: ${invoice.title}
• Issue Date: ${formatDate(invoice.issueDate)}
• Payment Due Date: ${formatDate(invoice.dueDate)}
• Total Invoiced: ${formatZAR(invoice.totalAmount)}
• Amount Paid to Date: ${formatZAR(invoice.amountPaid)}
• OUTSTANDING BALANCE DUE: ${formatZAR(invoice.balanceDue)}

BANKING DETAILS FOR EFT PAYMENT:
Bank: ${settings.bankName}
Account Name: ${settings.accountName}
Account Number: ${settings.accountNumber}
Account Type: ${settings.accountType}
Branch Code: ${settings.branchCode}
Payment Reference: ${invoice.paymentReference || invoice.invoiceNumber}

Please email your proof of payment to ${settings.email}.

Kind regards,

Accounts Department
${settings.companyName}
Phone: ${settings.phone}
Email: ${settings.email}`;

    this.openEmail(client.email || '', subject, body);
  }

  /**
   * 1-Tap Email Receipt template
   */
  static sendReceiptEmail(receipt: MilestoneReceipt, client: Client, settings: CompanySettings): void {
    const subject = `Official Payment Receipt ${receipt.receiptNumber} | ${settings.shortName}`;
    const body = `Dear ${client.name},

We confirm and acknowledge receipt of your construction milestone payment:

RECEIPT DETAILS:
• Receipt Number: ${receipt.receiptNumber}
• Date Received: ${formatDate(receipt.paymentDate)}
• Amount Received: ${formatZAR(receipt.amountPaid)}
• Payment Method: ${receipt.paymentMethod}
• Bank Reference: ${receipt.bankReference || '-'}
• Milestone Credited: ${receipt.milestoneDescription}
• Remaining Project Balance: ${formatZAR(receipt.remainingProjectBalance)}

Thank you for your prompt settlement.

Kind regards,

${settings.companyName}
Phone: ${settings.phone}
Email: ${settings.email}`;

    this.openEmail(client.email || '', subject, body);
  }
}
