import AuthBanner from '../components/AuthBanner';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuthController } from '../hooks/useAuthController';

export default function AuthPage() {
  const {
    mode,
    email,
    password,
    displayName,
    showPassword,
    selectedCats,
    loading,
    setMode,
    setEmail,
    setPassword,
    setDisplayName,
    setShowPassword,
    toggleCat,
    handleResetPassword,
    handleAuthSubmit,
    handleGoogleSignIn,
  } = useAuthController();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <AuthBanner />

        {/* Right Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {mode !== 'reset' ? (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Увійти
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Зареєструватися
              </button>
            </div>
          ) : null}

          {mode === 'reset' ? (
            <ResetPasswordForm
              email={email}
              setEmail={setEmail}
              loading={loading}
              onSubmit={handleResetPassword}
              onBackToLogin={() => setMode('login')}
            />
          ) : mode === 'login' ? (
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              onSubmit={handleAuthSubmit}
              onForgotPassword={() => setMode('reset')}
            />
          ) : (
            <RegisterForm
              displayName={displayName}
              setDisplayName={setDisplayName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              selectedCats={selectedCats}
              toggleCat={toggleCat}
              loading={loading}
              onSubmit={handleAuthSubmit}
            />
          )}

          {mode !== 'reset' && (
            <GoogleSignInButton
              loading={loading}
              onSignIn={handleGoogleSignIn}
            />
          )}
        </div>
      </div>
    </div>
  );
}
