import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Play, Webhook, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Google = () => <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.5H3.2a10 10 0 0 0 0 9.1L6.5 14Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.2 7.5l3.3 2.6A5.8 5.8 0 0 1 12 6Z"/></svg>;
const GitHub = () => <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.88c-2.78.61-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.84c.85 0 1.71.12 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.73c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>;

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [remember, setRemember] = useState(true);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const submit = async (data) => { const res = await login(data); if (res.success) navigate(location.state?.from?.pathname || '/dashboard', { replace: true }); };
  const demo = () => { setValue('email', 'demo@automatex.io', { shouldValidate: true }); setValue('password', 'AutomateX@2026', { shouldValidate: true }); toast.success('Demo account is ready'); };

  return <main className="auth-page">
    <section className="auth-story">
      <Link to="/" className="auth-brand auth-reveal"><span><Zap size={17}/></span>AutomateX</Link>
      <div className="auth-story-copy auth-reveal auth-delay-1"><p>One workspace. Every workflow.</p><h2>Good to have you<br/>back at the controls.</h2><div>Pick up where you left off. Your workflows, run history, and credentials are waiting.</div></div>
      <div className="auth-flow auth-reveal auth-delay-2" aria-hidden="true">
        <header><div><i/> Customer onboarding</div><span>Live</span></header>
        <FlowRow icon={<Webhook/>} title="Form submitted" meta="Trigger · just now"/><b><i/></b>
        <FlowRow icon={<Mail/>} title="Send welcome email" meta="Completed in 0.8s" blue/><b><i/></b>
        <FlowRow icon={<Check/>} title="Create follow-up task" meta="Running now" green running/>
      </div>
      <footer className="auth-reveal auth-delay-3"><strong>12,000+</strong> builders automate their work with AutomateX</footer>
    </section>
    <section className="auth-form-side">
      <div className="auth-mobile-top"><Link to="/" className="auth-brand"><span><Zap size={16}/></span>AutomateX</Link></div>
      <div className="auth-form-wrap auth-reveal">
        <Link to="/" className="auth-back"><ArrowLeft/> Back to home</Link>
        <header className="auth-form-header"><span>Welcome back</span><h1>Sign in to your account</h1><p>Enter your details to continue to your workspace.</p></header>
        <div className="auth-social"><button onClick={() => toast('Google sign in will be available soon.')}><Google/>Continue with Google</button><button onClick={() => toast('GitHub sign in will be available soon.')}><GitHub/>GitHub</button></div>
        <div className="auth-divider"><span>or continue with email</span></div>
        <form onSubmit={handleSubmit(submit)} className="auth-form" noValidate>
          <Field label="Email address" error={errors.email?.message}><div className={`auth-input ${errors.email?'error':''}`}><Mail/><input type="email" autoComplete="username" placeholder="you@company.com" {...register('email',{required:'Email address is required',pattern:{value:/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,message:'Enter a valid email address'}})}/></div></Field>
          <Field label="Password" error={errors.password?.message} action={<button type="button" onClick={() => toast('Password recovery is coming soon.')}>Forgot password?</button>}><div className={`auth-input ${errors.password?'error':''}`}><LockKeyhole/><input type={visible?'text':'password'} autoComplete="current-password" placeholder="Enter your password" {...register('password',{required:'Password is required'})}/><button type="button" className="auth-eye" onClick={()=>setVisible(!visible)}>{visible?<EyeOff/>:<Eye/>}</button></div></Field>
          <label className="auth-check"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>Keep me signed in on this device</span></label>
          <button className="auth-submit" disabled={loading}>{loading?<><i/>Signing in…</>:<>Sign in <ArrowRight/></>}</button>
        </form>
        <button className="auth-demo" onClick={demo}><Play fill="currentColor"/>Use demo account</button>
        <p className="auth-switch">New to AutomateX? <Link to="/register">Create a free account</Link></p>
      </div>
    </section>
  </main>;
};

const Field = ({label,error,action,children}) => <div className="auth-field"><div className="auth-label"><label>{label}</label>{action}</div>{children}{error&&<small>{error}</small>}</div>;
const FlowRow = ({icon,title,meta,blue,green,running}) => <div className={`auth-flow-row ${running?'active':''}`}><span className={blue?'blue':green?'green':''}>{React.cloneElement(icon,{size:16})}</span><div><strong>{title}</strong><small>{meta}</small></div>{running?<em/>:<Check/>}</div>;
