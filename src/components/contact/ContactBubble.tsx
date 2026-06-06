import { useEffect, useRef, useState } from 'react';
import { Mail, MessageCircle, MessagesSquare, X } from 'lucide-react';

const DEFAULT_SUPPORT_EMAIL = 'support@example.com';
const DEFAULT_MESSENGER_USERNAME = 'your-messenger-username';
const DEFAULT_WHATSAPP_NUMBER = '639000000000';
const SUPPORT_SUBJECT = 'BLEPP Review support request';
const SUPPORT_MESSAGE =
  'Hi BLEPP Review team,\n\nI need help with:\n\n';
const WHATSAPP_MESSAGE =
  'Hi BLEPP Review team, I need help with BLEPP Review.';

export function buildEmailUrl(
  email: string,
  subject = SUPPORT_SUBJECT,
  message = SUPPORT_MESSAGE
) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export function buildMessengerUrl(username: string) {
  return `https://m.me/${encodeURIComponent(username)}`;
}

export function buildWhatsAppUrl(
  number: string,
  message = WHATSAPP_MESSAGE
) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

const supportEmail =
  import.meta.env.VITE_SUPPORT_EMAIL || DEFAULT_SUPPORT_EMAIL;
const messengerUsername =
  import.meta.env.VITE_MESSENGER_USERNAME || DEFAULT_MESSENGER_USERNAME;
const whatsAppNumber =
  import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;

const channels = [
  {
    label: 'Email',
    description: supportEmail,
    href: buildEmailUrl(supportEmail),
    icon: Mail
  },
  {
    label: 'Messenger',
    description: 'Chat on Messenger',
    href: buildMessengerUrl(messengerUsername),
    icon: MessagesSquare
  },
  {
    label: 'WhatsApp',
    description: 'Chat on WhatsApp',
    href: buildWhatsAppUrl(whatsAppNumber),
    icon: MessageCircle
  }
] as const;

export function ContactBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    firstLinkRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {isOpen && (
        <div
          id="contact-options"
          className="w-[calc(100vw-2rem)] max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          aria-label="Contact options"
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Contact us
            </p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Choose how you would like to reach us.
            </p>
          </div>
          <div className="p-2">
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.label}
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 dark:hover:bg-slate-800"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {channel.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {channel.description}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
        aria-expanded={isOpen}
        aria-controls="contact-options"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal-600 px-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 sm:h-14 sm:px-5"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        )}
        <span>Contact us</span>
      </button>
    </div>
  );
}
