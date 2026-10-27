import React from 'react';

interface GoogleSignInButtonProps {
  loading: boolean;
  onSignIn: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  loading,
  onSignIn,
}) => {
  return (
    <>
      {/* Divider OR */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-400">
          АБО
        </span>
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={onSignIn}
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm flex items-center justify-center gap-3 transition cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.58-1.14 2.92-2.4 3.82v3.18h3.88c2.27-2.09 3.54-5.17 3.54-9.24z"
          />
          <path
            fill="#34A853"
            d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.18c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96h-4.01v3.28C3.515 21.3 7.565 24 12.255 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.535 14.11c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.21h-4.01C.705 7.85.255 9.72.255 11.8s.45 3.95 1.27 5.59l4.01-3.28z"
          />
          <path
            fill="#EA4335"
            d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.525 6.21l4.01 3.28c.95-2.85 3.6-4.74 6.72-4.74z"
          />
        </svg>
        <span>Увійти через Google</span>
      </button>
    </>
  );
};

export default GoogleSignInButton;
