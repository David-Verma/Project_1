import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api, { errorText } from '../api/axios';
import { useAuth } from '../context/AuthContext';
export default function Auth({ mode }) {
  const register = mode === 'register'; const { authenticate } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '' }); const [code, setCode] = useState(''); const [verificationPending, setVerificationPending] = useState(false); const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (verificationPending) {
        const { data } = await api.post('/auth/verify-email', { email: form.email, code });
        authenticate(data);
        navigate(params.get('next') || location.state?.from || '/dashboard', { replace: true });
      } else {
        const { data } = await api.post(`/auth/${register ? 'register' : 'login'}`, form);
        if (register) {
          setVerificationPending(true);
          setNotice(data.message);
        } else {
          authenticate(data);
          navigate(params.get('next') || location.state?.from || '/dashboard', { replace: true });
        }
      }
    } catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  }
  async function resendCode() {
    setBusy(true); setError(''); setNotice('');
    try {
      const { data } = await api.post('/auth/resend-verification', { email: form.email });
      setNotice(data.message);
    } catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  }
  function editRegistration() {
    setVerificationPending(false);
    setCode('');
    setNotice('');
    setError('');
  }
  return <div className="auth-wrap"><div className="auth-card">
    <p className="eyebrow">{verificationPending ? 'Check your inbox' : register ? 'Make a little space for your ideas' : 'Good to have you back'}</p>
    <h1>{verificationPending ? 'Verify your email.' : register ? 'Join the conversation.' : 'Welcome back.'}</h1>
    <p className="muted">{verificationPending ? `Enter the 6-digit code sent to ${form.email}.` : register ? 'Create an account and start sharing what you learn.' : 'Sign in to pick up where you left off.'}</p>
    {notice && <div className="notice">{notice}</div>}
    {error && <div className="notice notice-error">{error}</div>}
    <form className="form-stack" onSubmit={submit}>
      {!verificationPending && register && <label>Your name<input name="name" value={form.name} onChange={change} required maxLength="80" autoComplete="name"/></label>}
      {!verificationPending && <label>Email address<input name="email" type="email" value={form.email} onChange={change} required autoComplete="email"/></label>}
      {verificationPending && <label>Verification code<input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required pattern="[0-9]{6}" maxLength="6"/></label>}
      {!verificationPending && <label>Password<input name="password" type="password" value={form.password} onChange={change} required minLength={register ? 8 : 1} autoComplete={register ? 'new-password' : 'current-password'}/>{register && <small>Use at least 8 characters.</small>}</label>}
      <button className="button button-dark button-full" disabled={busy}>{busy ? 'One moment…' : verificationPending ? 'Verify email' : register ? 'Create account' : 'Log in'} <span>↗</span></button>
    </form>
    {verificationPending && <button className="button button-full" type="button" onClick={resendCode} disabled={busy}>Resend verification code</button>}
    {verificationPending
      ? <p className="auth-switch">Wrong email? <button className="text-button" type="button" onClick={editRegistration}>Go back</button></p>
      : <p className="auth-switch">{register ? 'Already writing here?' : 'New around here?'} <Link to={register ? '/login' : '/register'}>{register ? 'Log in' : 'Create an account'}</Link></p>}
  </div><div className="auth-side"><span className="quote-mark">“</span><blockquote>The best way to learn is to explain what you know — and notice what you don't.</blockquote><span className="quote-by">A good habit for curious minds</span></div></div>;
}
