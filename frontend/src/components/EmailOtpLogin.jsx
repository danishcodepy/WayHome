import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoaderCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

/**
 * EmailOtpLogin — a self-contained OTP flow component.
 *
 * Props:
 *   onBack      – called when the user wants to return to password login
 *   remember    – forwarded to AuthContext.login so persistence matches normal login
 */
export default function EmailOtpLogin({ onBack, remember = true }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // ── Step management ───────────────────────────────────────────────────
  // 'email'  – user enters their email
  // 'otp'    – user enters the 6-digit code
  const [step, setStep] = useState('email');

  // ── Shared state ──────────────────────────────────────────────────────
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [notice, setNotice] = useState('');

  // ── OTP state ─────────────────────────────────────────────────────────
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const cooldownRef = useRef(null);

  // ── Countdown timer ───────────────────────────────────────────────────
  const startCooldown = useCallback((seconds = 60) => {
    setResendCooldown(seconds);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  // Focus first OTP box when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    }
  }, [step]);

  // ── Send OTP ──────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      await api.sendOtp(email.trim().toLowerCase());
      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      startCooldown(60);
      setNotice('OTP sent! Please check your inbox.');
    } catch (err) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setError('');
    setNotice('');
    setBusy(true);

    try {
      const user = await api.verifyOtp(email.trim().toLowerCase(), code);
      if (!user) throw new Error('Verification failed. Please try again.');

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
      setError(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Accept only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  // ── Resend ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0 || busy) return;
    setError('');
    setNotice('');
    setBusy(true);

    try {
      await api.sendOtp(email.trim().toLowerCase());
      setOtp(['', '', '', '', '', '']);
      startCooldown(60);
      setNotice('A new OTP has been sent to your email.');
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    } catch (err) {
      setError(err?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER – Email entry step
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'email') {
    return (
      <div className="otp-flow">
        <div className="otp-flow__header">
          <div className="otp-flow__icon">
            <Mail size={22} />
          </div>
          <h3 className="otp-flow__title">Email OTP Login</h3>
          <p className="otp-flow__subtitle">
            We'll send a one-time code to your email address.
          </p>
        </div>

        <form className="premium-form" onSubmit={handleSendOtp} aria-busy={busy}>
          <fieldset disabled={busy}>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <label>
              Email address
              <input
                id="otp-email-input"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
              />
            </label>

            <button
              id="otp-send-btn"
              className="primary-button"
              disabled={busy || !email.trim()}
            >
              {busy ? (
                <>
                  <LoaderCircle size={16} className="button-spinner" />
                  Sending OTP…
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </fieldset>
        </form>

        <button
          type="button"
          className="otp-flow__back-link"
          onClick={onBack}
        >
          <ArrowLeft size={14} />
          Back to password login
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER – OTP verification step
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="otp-flow">
      <div className="otp-flow__header">
        <div className="otp-flow__icon otp-flow__icon--success">
          <Mail size={22} />
        </div>
        <h3 className="otp-flow__title">Verify your email</h3>
        <p className="otp-flow__subtitle">
          OTP sent to{' '}
          <strong className="otp-flow__email-display">{email}</strong>
        </p>
      </div>

      <form className="premium-form" onSubmit={handleVerifyOtp} aria-busy={busy}>
        <fieldset disabled={busy}>
          {notice && (
            <p className="form-notice" role="status">
              {notice}
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {/* OTP boxes */}
          <div className="otp-boxes" aria-label="Enter 6-digit OTP">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-box-${i}`}
                ref={el => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                autoComplete="one-time-code"
                className={`otp-box ${digit ? 'otp-box--filled' : ''}`}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          <button
            id="otp-verify-btn"
            className="primary-button"
            disabled={busy || otp.join('').length !== 6}
          >
            {busy ? (
              <>
                <LoaderCircle size={16} className="button-spinner" />
                Verifying…
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        </fieldset>
      </form>

      {/* Resend */}
      <div className="otp-flow__resend">
        {resendCooldown > 0 ? (
          <span className="otp-flow__cooldown">
            Resend OTP in {resendCooldown}s
          </span>
        ) : (
          <button
            type="button"
            className="otp-flow__resend-btn"
            onClick={handleResend}
            disabled={busy}
          >
            <RefreshCw size={13} />
            Resend OTP
          </button>
        )}
      </div>

      {/* Change email */}
      <button
        type="button"
        className="otp-flow__back-link"
        onClick={() => {
          setStep('email');
          setError('');
          setNotice('');
          setOtp(['', '', '', '', '', '']);
        }}
      >
        <ArrowLeft size={14} />
        Change email
      </button>
    </div>
  );
}
