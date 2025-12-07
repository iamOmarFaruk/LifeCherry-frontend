import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
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

    toast.custom(
      (t) => (
        <div
          className={`pointer-events-auto w-[360px] max-w-full rounded-2xl border border-border bg-white shadow-2xl ring-1 ring-black/5 p-5 flex flex-col gap-4 transition-all duration-300 ${
            t.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-cherry-50 text-cherry flex items-center justify-center border border-cherry-100">
              <FiShield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-text-primary">We respect your privacy</p>
              <p className="text-sm text-text-secondary leading-snug">
                We use cookies to personalize your experience. Read our{' '}
                <Link to="/privacy" className="text-cherry font-semibold hover:underline">Privacy Policy</Link> and{' '}
                <Link to="/terms" className="text-cherry font-semibold hover:underline">Terms</Link>.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCookie(COOKIE_KEY, 'accepted', 365);
              toast.dismiss(toastId);
            }}
            className="btn-capsule inline-flex items-center justify-center gap-2 text-sm w-full"
          >
            <FiCheck className="w-4 h-4" />
            Accept
          </button>
        </div>
      ),
      {
        id: toastId,
        duration: Infinity,
        position: 'bottom-center'
      }
    );
  }, []);

  return null;
};

export default CookieConsentToast;
