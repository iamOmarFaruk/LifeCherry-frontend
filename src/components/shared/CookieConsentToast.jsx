import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiShield, FiCheck } from 'react-icons/fi';

// Simple cookie helpers
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

const COOKIE_KEY = 'lc_cookie_consent';

const CookieConsentToast = () => {
  useEffect(() => {
    const hasConsent = getCookie(COOKIE_KEY);
    if (hasConsent) return;

    const toastId = 'cookie-consent';

    const ToastContent = ({ t }) => {
      const [mounted, setMounted] = useState(false);

      useEffect(() => {
        const raf = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(raf);
      }, []);

      const isVisible = mounted && t.visible;

      return (
        <div
          className={`pointer-events-auto w-[480px] max-w-full rounded-2xl border border-border bg-white shadow-2xl ring-1 ring-black/5 p-5 flex flex-col gap-4 transition-all duration-350 origin-bottom ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex items-start gap-3 md:flex-1">
              <div className="h-10 w-10 rounded-full bg-cherry-50 text-cherry flex items-center justify-center border border-cherry-100">
                <FiShield className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-text-primary">We respect your privacy</p>
                <p className="text-sm text-text-secondary leading-snug">
                  We use cookies to personalize your experience. Read our{' '}
                  <a href="/privacy" className="text-cherry font-semibold hover:underline">Privacy Policy</a> and{' '}
                  <a href="/terms" className="text-cherry font-semibold hover:underline">Terms</a>.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setCookie(COOKIE_KEY, 'accepted', 365);
                toast.dismiss(toastId);
              }}
              className="btn-capsule inline-flex items-center justify-center gap-2 text-sm self-start md:self-center"
            >
              <FiCheck className="w-4 h-4" />
              Accept
            </button>
          </div>
        </div>
      );
    };

    const showToast = () => toast.custom((t) => <ToastContent t={t} />, {
      id: toastId,
      duration: Infinity,
      position: 'bottom-center'
    });

    // slight delay before showing
    const timer = setTimeout(() => showToast(), 3000);

    return () => {
      clearTimeout(timer);
      toast.dismiss(toastId);
    };
  }, []);

  return null;
};

export default CookieConsentToast;
