import { useState } from 'react';
import { ArrowLeft, ArrowRight, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { currentUser, loginUser, register, storageError } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (currentUser) return <Navigate to="/app" replace />;

  const submit = (event) => {
    event.preventDefault();
    setError('');
    if (isRegister && password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }
    const result = isRegister ? register({ name, email, password }) : loginUser({ email, password });
    if (!result.success) {
      setError(result.error);
      return;
    }
    navigate('/app', { replace: true });
  };

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />
      <section className="auth-card">
        <Link className="brand-lockup auth-brand" to="/">
          <span className="brand-symbol"><CircleDollarSign size={20} /></span>
          <span>smart<span>spend</span></span>
        </Link>
        <Link to="/" className="auth-back"><ArrowLeft size={14} /> Back to home</Link>
        <div className="auth-heading">
          <div className="auth-icon"><CircleDollarSign size={20} /></div>
          <div className="eyebrow">{isRegister ? 'YOUR PERSONAL WORKSPACE' : 'WELCOME BACK'}</div>
          <h1>{isRegister ? 'Create your account' : 'User sign in'}</h1>
          <p>{isRegister ? 'Your budgets and transactions stay private to your account on this device.' : 'Pick up where you left off with your personal finances.'}</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {isRegister && <div><label className="form-label" htmlFor="auth-name">Full name</label><input id="auth-name" className="form-control" value={name} onChange={(event) => setName(event.target.value)} maxLength="70" autoComplete="name" required /></div>}
          <div><label className="form-label" htmlFor="auth-email">Email address</label><input id="auth-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></div>
          <div><label className="form-label" htmlFor="auth-password">Password</label><input id="auth-password" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={isRegister ? 8 : undefined} autoComplete={isRegister ? 'new-password' : 'current-password'} required /></div>
          {isRegister && <div><label className="form-label" htmlFor="auth-confirm-password">Confirm password</label><input id="auth-confirm-password" className="form-control" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required /></div>}
          {(error || storageError) && <div className="auth-error" role="alert">{error || storageError}</div>}
          <button className="btn btn-primary auth-submit" type="submit">{isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button>
        </form>
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to SmartSpend?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
      </section>
      <p className="auth-privacy"><ShieldCheck size={14} /> Private by design · your information stays in this browser</p>
    </main>
  );
}
