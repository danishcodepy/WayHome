import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Eye,
    EyeOff,
    GraduationCap,
    House,
    Building2,
    LoaderCircle,
    Mail,
    ArrowLeft,
    RefreshCw,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { GoogleIcon } from './Login';
import { api } from '../services/api';

export default function Register() {
    const toast = useToast();
    const { login } = useAuth();
    const [params] = useSearchParams();
    const navigate = useNavigate();

    // ── Step management ('form' | 'otp') ─────────────────────────────────────
    const [step, setStep] = useState('form');

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: ['Student', 'Tenant', 'Property Manager'].includes(params.get('role'))
            ? params.get('role')
            : 'Student',
        password: '',
        confirm: '',
    });

    const [terms, setTerms] = useState(false);
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);

    // ── OTP State ────────────────────────────────────────────────────────────
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);
    const cooldownRef = useRef(null);

    const startCooldown = useCallback((seconds = 60) => {
        setResendCooldown(seconds);
        clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => () => clearInterval(cooldownRef.current), []);

    // Focus first OTP input when step changes to 'otp'
    useEffect(() => {
        if (step === 'otp') {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    const field = (key) => ({
        value: form[key],
        onChange: (e) => {
            setForm({ ...form, [key]: e.target.value });
            setError('');
        },
        required: true,
    });

    // ── Step 1: Submit Details & Request OTP ─────────────────────────────────
    const handleInitiateRegister = async (e) => {
        e.preventDefault();
        setError('');
        setNotice('');

        if (form.password !== form.confirm) {
            setError('Your passwords don’t match. Please try again.');
            return;
        }

        if (!terms) {
            setError('Please accept the terms to continue.');
            return;
        }

        setBusy(true);

        try {
            const normalizedEmail = form.email.trim().toLowerCase();
            await api.sendRegisterOtp(normalizedEmail);

            setOtp(['', '', '', '', '', '']);
            setStep('otp');
            startCooldown(60);
            setNotice('Verification code sent! Please check your inbox.');
        } catch (e) {
            console.error('Registration OTP request error:', e);
            setError(
                e instanceof Error
                    ? e.message
                    : 'Failed to send verification code. Please try again.'
            );
        } finally {
            setBusy(false);
        }
    };

    // ── Resend Registration OTP ──────────────────────────────────────────────
    const handleResendOtp = async () => {
        if (resendCooldown > 0 || busy) return;
        setError('');
        setNotice('');
        setBusy(true);

        try {
            const normalizedEmail = form.email.trim().toLowerCase();
            await api.sendRegisterOtp(normalizedEmail);
            startCooldown(60);
            setNotice('A fresh verification code has been sent to your email.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to resend code.');
        } finally {
            setBusy(false);
        }
    };

    // ── OTP input handlers ───────────────────────────────────────────────────
    const handleOtpChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const updated = [...otp];
        updated[index] = digit;
        setOtp(updated);
        setError('');

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;

        const updated = ['', '', '', '', '', ''];
        for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i];
        setOtp(updated);

        const focusTarget = Math.min(pasted.length, 5);
        inputRefs.current[focusTarget]?.focus();
    };

    // ── Step 2: Verify OTP & Create Account ──────────────────────────────────
    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit verification code.');
            return;
        }

        setError('');
        setNotice('');
        setBusy(true);

        try {
            const { confirm, ...data } = form;
            const res = await api.register({
                ...data,
                email: form.email.trim().toLowerCase(),
                otp: code,
            });

            toast('Account created and verified successfully!');

            if (res && res.token) {
                login(res, { remember: true });
                const dest =
                    res.role === 'Admin'
                        ? '/admin'
                        : res.role === 'Property Manager'
                        ? '/manager'
                        : '/tenant';
                navigate(dest);
            } else {
                navigate(`/login?registered=1&role=${encodeURIComponent(form.role)}`);
            }
        } catch (e) {
            console.error('Registration verification error:', e);
            setError(
                e instanceof Error
                    ? e.message
                    : 'Verification failed. Please check the code and try again.'
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout registering>
            {step === 'form' ? (
                <>
                    <h2>Create your account</h2>
                    <p className="auth-subtitle">Your next place is one step closer.</p>

                    <form
                        className="premium-form register-form"
                        onSubmit={handleInitiateRegister}
                        aria-busy={busy}
                    >
                        <fieldset disabled={busy}>
                            {error && (
                                <p className="form-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <label>
                                Full name
                                <input
                                    {...field('name')}
                                    autoComplete="name"
                                    placeholder="Enter your full name"
                                />
                            </label>

                            <label>
                                Email address
                                <input
                                    {...field('email')}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                />
                            </label>

                            <label>
                                Phone number
                                <input
                                    {...field('phone')}
                                    type="tel"
                                    autoComplete="tel"
                                    minLength="10"
                                    placeholder="Enter your phone number"
                                />
                            </label>

                            <div>
                                <p className="ui-field-label">I am joining as</p>
                                <div
                                    className="role-choices"
                                    role="radiogroup"
                                    aria-label="Account role"
                                >
                                    {[
                                        ['Student', GraduationCap, 'Student'],
                                        ['Tenant', House, 'Tenant'],
                                        ['Property Manager', Building2, 'Owner'],
                                    ].map(([value, Icon, label]) => (
                                        <label className="role-choice" key={value}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value={value}
                                                checked={form.role === value}
                                                onChange={() =>
                                                    setForm({ ...form, role: value })
                                                }
                                            />
                                            <Icon size={20} />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-two-columns">
                                <label>
                                    Password
                                    <span className="password-field">
                                        <input
                                            {...field('password')}
                                            type={show ? 'text' : 'password'}
                                            minLength="8"
                                            autoComplete="new-password"
                                            placeholder="At least 8 characters"
                                        />
                                        <button
                                            type="button"
                                            aria-label={show ? 'Hide password' : 'Show password'}
                                            onClick={() => setShow(!show)}
                                        >
                                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </span>
                                </label>

                                <label>
                                    Confirm password
                                    <input
                                        {...field('confirm')}
                                        type={show ? 'text' : 'password'}
                                        minLength="8"
                                        autoComplete="new-password"
                                        placeholder="Re-enter password"
                                    />
                                </label>
                            </div>

                            <label
                                className="terms-label"
                                style={{ flexDirection: 'row', fontWeight: 400 }}
                            >
                                <input
                                    type="checkbox"
                                    required
                                    checked={terms}
                                    onChange={(e) => setTerms(e.target.checked)}
                                />
                                <span>
                                    I agree to the{' '}
                                    <Link to="/terms" target="_blank" rel="noreferrer">
                                        Terms & Conditions
                                    </Link>
                                </span>
                            </label>

                            <button className="primary-button" disabled={busy} type="submit">
                                {busy ? (
                                    <>
                                        <LoaderCircle size={16} className="button-spinner" />
                                        Sending verification code…
                                    </>
                                ) : (
                                    'Continue with Email Verification'
                                )}
                            </button>
                        </fieldset>
                    </form>

                    <div className="auth-divider">or</div>

                    <button
                        className="outline-button w-full"
                        disabled
                        title="Google authentication is not connected"
                        type="button"
                    >
                        <GoogleIcon /> Continue with Google
                    </button>

                    <p className="auth-unavailable">
                        Your account is securely stored in WayHome. Social sign-in is currently unavailable.
                    </p>

                    <p className="auth-register-link">
                        Already have an account? <Link to="/login">Log in</Link>
                    </p>
                </>
            ) : (
                /* ── STEP 2: OTP Verification ── */
                <div className="otp-flow">
                    <div className="otp-flow__header">
                        <div className="otp-flow__icon otp-flow__icon--success">
                            <Mail size={22} />
                        </div>
                        <h2 className="otp-flow__title">Verify your email</h2>
                        <p className="otp-flow__subtitle">
                            We’ve sent a 6-digit code to{' '}
                            <strong className="otp-flow__email-display">{form.email}</strong>
                        </p>
                    </div>

                    <form
                        className="premium-form"
                        onSubmit={handleVerifyAndRegister}
                        aria-busy={busy}
                    >
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

                            {/* 6 OTP boxes */}
                            <div className="otp-boxes" aria-label="Enter 6-digit verification code">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`register-otp-box-${i}`}
                                        ref={(el) => (inputRefs.current[i] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        maxLength={1}
                                        autoComplete="one-time-code"
                                        className={`otp-box ${digit ? 'otp-box--filled' : ''}`}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        onPaste={i === 0 ? handleOtpPaste : undefined}
                                        aria-label={`Code digit ${i + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                id="register-verify-btn"
                                className="primary-button"
                                disabled={busy || otp.join('').length !== 6}
                                type="submit"
                            >
                                {busy ? (
                                    <>
                                        <LoaderCircle size={16} className="button-spinner" />
                                        Verifying & Creating Account…
                                    </>
                                ) : (
                                    'Verify & Create Account'
                                )}
                            </button>
                        </fieldset>
                    </form>

                    {/* Resend section */}
                    <div className="otp-flow__resend">
                        {resendCooldown > 0 ? (
                            <span className="otp-flow__cooldown">
                                Resend code in {resendCooldown}s
                            </span>
                        ) : (
                            <button
                                type="button"
                                className="otp-flow__resend-btn"
                                onClick={handleResendOtp}
                                disabled={busy}
                            >
                                <RefreshCw size={14} />
                                Resend verification code
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        className="otp-flow__back-link"
                        onClick={() => {
                            setStep('form');
                            setError('');
                            setNotice('');
                        }}
                    >
                        <ArrowLeft size={14} />
                        Edit details / Change email
                    </button>
                </div>
            )}
        </AuthLayout>
    );
}
