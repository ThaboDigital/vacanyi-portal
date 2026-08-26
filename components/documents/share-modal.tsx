'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { WhatsAppShareService } from '@/lib/share/whatsapp';
import { EmailShareService } from '@/lib/share/email';
import { Share2, Mail, Copy, Check, MessageSquare } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  recipientName: string;
  phone: string;
  email?: string;
  messageText: string;
  emailSubject?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  recipientName,
  phone,
  email,
  messageText,
  emailSubject,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [editableMessage, setEditableMessage] = useState(messageText);

  React.useEffect(() => {
    setEditableMessage(messageText);
    setCopied(false);
  }, [messageText]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editableMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    WhatsAppShareService.openWhatsApp(phone, editableMessage);
  };

  const handleSendEmail = () => {
    if (!email) return;
    EmailShareService.openEmail(
      email,
      emailSubject || 'Document from Vacanyi Building Construction',
      editableMessage
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`Recipient: ${recipientName} (${phone})`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold text-slate-700">Message Preview & Notes:</label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={editableMessage}
            onChange={(e) => setEditableMessage(e.target.value)}
            rows={8}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono whitespace-pre-wrap focus:bg-white focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Send on WhatsApp</span>
          </button>

          {email ? (
            <button
              onClick={handleSendEmail}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white font-bold text-xs transition-all shadow-xs"
            >
              <Mail className="w-4 h-4 text-[#D5A11E]" />
              <span>Send via Email</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              <span>No Email on File</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
