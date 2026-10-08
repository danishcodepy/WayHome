import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Eye,
    EyeOff,
    GraduationCap,
    House,
    Building2,
    LoaderCircle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../components/AuthLayout';
import { GoogleIcon } from './Login';
import { api } from '../services/api';

export default function Register() {
    const toast = useToast();
    const [params] = useSearchParams();
    const navigate = useNavigate();

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
    const [busy, setBusy] = useState(false);

    const field = (key) => ({
        value: form[key],
        onChange: (e) => setForm({ ...form, [key]: e.target.value }),
        required: true,
    });

    const submit = async (e) => {
        e.preventDefault();
        setError('');

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
            const { confirm, ...data } = form;


            await api.register(data);

            toast('Account created successfully');
            navigate(`/login?registered=1&role=${encodeURIComponent(form.role)}`);
        } catch (e) {
            console.error('Registration error:', e);
            setError(
                e instanceof Error
                    ? e.message
                    : 'We couldn’t create your account. Please try again.'
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout registering>
            <h2>Create your account</h2>
            <p className="auth-subtitle">Your next place is one step closer.</p>

            <form
                className="premium-form register-form"
                onSubmit={submit}
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
                                Creating account…
                            </>
                        ) : (
                            'Create Account'
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
        </AuthLayout>
    );
}
