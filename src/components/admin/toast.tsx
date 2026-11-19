"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error";

export interface ToastState {
  message: string;
  type: ToastType;
}

export default function Toast({
  message,
  type,
  onClose,
}: ToastState & { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
        type === "success" ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="m6.5 10.5 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="m7 7 6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {message}
    </div>
  );
}
