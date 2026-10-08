import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Apple,
  ChevronRight,
  LoaderCircle,
  GraduationCap,
  Home,
  ShieldCheck,
} from 'lucide-react';

import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { api, isDemo } from '../services/api';

export function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.5Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-1 6.7-2.5l-3.3-2.6c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.8a6 6 0 0 1 0-3.6V7.6H3a10 10 0 0 0 0 8.8Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.1c1.5 0 2.8.5 3.8 1.5L18.7 5A9.5 9.5 0 0 0 12 2a10 10 0 0 0-9 5.6l3.4 2.6C7.2 7.9 9.4 6.1 12 6.1Z"
      />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const roles = [
    {
      value: 'Student',
      label: 'Student',
      description: 'Find student housing',
      icon: GraduationCap,
    },
    {
      value: 'Tenant',
      label: 'Tenant',
      description: 'Find a home to rent',
      icon: Home,
    },
    {
      value: 'Property Manager',
      label: 'Property Owner',
      description: 'Manage your properties',
      icon: Home,
    },
    {
      value: 'Admin',
      label: 'Admin',
      description: 'Manage WayHome',
      icon: ShieldCheck,
    },
  ];

  const initialRole = roles.some(
    role => role.value === params.get('role')
  )
    ? params.get('role')
    : 'Student';

  const [selectedRole, setSelectedRole] = useState(initialRole);

  const signIn = async credentials => {
    setError('');
    setBusy(true);

    try {
      const user = await api.login(credentials);

      login(user, { remember });

      const next = params.get('next');

      navigate(
        next?.startsWith('/') && !next.startsWith('//')
          ? next
          : user.role === 'Admin'
          ? '/admin'
          : user.role === 'Property Manager'
          ? '/manager'
          : '/tenant'
      );
    } catch (err) {
      console.error('Login error:', err);

      setError(
        err?.message ||
          'Unable to sign in. Please check your email, password and account type.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    signIn({
      email,
      password,
      role: selectedRole,
    });
  };

  return (
    <AuthLayout>
      <h2>Welcome back</h2>

      <p className="auth-subtitle">
        Log in to continue your search.
      </p>

      {params.get('registered') && (
        <p className="form-notice mb-5">
          {isDemo
            ? 'Demo registration complete. Choose a workspace below to explore.'
            : 'Account created. You can now sign in.'}
        </p>
      )}

      {/* ACCOUNT TYPE */}
      <div className="mb-6">
        <div className="mb-3">
          <strong className="text-sm text-slate-800">
            Login as
          </strong>

          <p className="text-xs text-slate-500 mt-1">
            Select the account type you are using.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {roles.map(role => {
            const Icon = role.icon;
            const active = selectedRole === role.value;

            return (
              <button
                key={role.value}
                type="button"
                disabled={busy}
                onClick={() => {
                  setSelectedRole(role.value);
                  setError('');
                }}
                className={`text-left rounded-xl border p-3 transition-all ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} />

                  <span className="font-semibold text-sm">
                    {role.label}
                  </span>
                </div>

                <p
                  className={`text-xs mt-1 ${
                    active
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 mt-3">
          Selected account:{' '}
          <strong className="text-slate-800">
            {selectedRole === 'Property Manager'
              ? 'Property Owner'
              : selectedRole}
          </strong>
        </p>
      </div>

      {/* LOGIN FORM */}
      <form
        className="premium-form"
        onSubmit={handleSubmit}
        aria-busy={busy}
      >
        <fieldset disabled={busy}>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <label>
            Email address

            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password

            <span className="password-field">
              <input
                type={show ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={
                  show ? 'Hide password' : 'Show password'
                }
              >
                {show ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </span>
          </label>

          <div className="auth-options">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={e =>
                  setRemember(e.target.checked)
                }
              />

              Remember me
            </label>

            <Link
              className="forgot-link"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          <button
            className="primary-button"
            disabled={busy}
          >
            {busy ? (
              <>
                <LoaderCircle
                  size={16}
                  className="button-spinner"
                />
                Logging in…
              </>
            ) : (
              `Log in as ${
                selectedRole === 'Property Manager'
                  ? 'Property Owner'
                  : selectedRole
              }`
            )}
          </button>
        </fieldset>
      </form>

      <div className="auth-divider">
        or continue with
      </div>

      <div className="social-logins">
        <button
          className="outline-button"
          disabled
          title="Google authentication is not connected"
        >
          <GoogleIcon />
          Google
        </button>

        <button
          className="outline-button"
          disabled
          title="Apple authentication is not connected"
        >
          <Apple size={18} />
          Apple
        </button>
      </div>

      <p className="auth-unavailable">
        Social sign-in is not connected in this preview.
      </p>

      <p className="auth-register-link">
        Don’t have an account?{' '}
        <Link to="/register">
          Create account
        </Link>
      </p>

      {/* DEMO LOGIN */}
      {isDemo && (
        <details
          className="demo-chooser"
          open={!!params.get('role')}
        >
          <summary>
            <ChevronRight size={13} />
            Explore a demo workspace
          </summary>

          <p className="text-xs text-slate-400 mt-2">
            Sample data. No real account needed.
          </p>

          <div className="demo-roles">
            {roles.map(role => (
              <button
                key={role.value}
                type="button"
                disabled={busy}
                onClick={() =>
                  signIn({
                    email:
                      role.value === 'Student'
                        ? 'ananya@example.com'
                        : role.value === 'Property Manager'
                        ? 'rohit.sharma@example.com'
                        : role.value === 'Admin'
                        ? 'arjun.kapoor@wayhome.example'
                        : 'ananya@example.com',
                    password: 'demo-preview',
                    role: role.value,
                  })
                }
              >
                {role.label === 'Property Manager'
                  ? 'Property Owner'
                  : role.label}
              </button>
            ))}
          </div>
        </details>
      )}
    </AuthLayout>
  );
}