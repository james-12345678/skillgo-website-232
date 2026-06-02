import * as React from "react";

interface InlineToastProps {
  message: string;
  blink?: boolean;
  className?: string;
}

export default function InlineToast({ message, blink = true, className = "" }: InlineToastProps) {
  return (
    <div aria-live="polite" className={`absolute inset-0 z-50 pointer-events-none ${className}`}>
      <div style={{ position: 'absolute', top: 8, right: 12 }}>
        <div
          className={`pointer-events-none inline-flex items-center justify-center rounded-md bg-gradient-to-r from-logo-gold to-neural-blue text-white px-3 py-1 text-xs font-semibold shadow-md ${blink ? 'toast-blink' : ''}`}
          style={{ maxWidth: 240 }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
