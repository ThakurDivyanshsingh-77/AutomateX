import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { BrandLogo } from '../components/common/BrandLogo';

export const Register = () => {
  const { register: createAccount, loading } = useAuth();
  const navigate = useNavigate();
  const [visible,setVisible] = useState(false), [terms,setTerms] = useState(false);
  const { register,handleSubmit,watch,formState:{errors} } = useForm();
  const password=watch('password','');
  const rules=useMemo(()=>[password.length>=8,/[A-Z]/.test(password),/[0-9]/.test(password)],[password]);
  const score=rules.filter(Boolean).length;
  const submit=async data=>{if(!terms)return toast.error('Please accept the terms to continue.');const res=await createAccount(data);if(res.success)navigate('/dashboard',{replace:true});};
  return <main className="auth-page">
    <section className="auth-story auth-story-register">
      <Link to="/" className="auth-brand auth-reveal"><BrandLogo/>AutomateX</Link>
      <div className="auth-story-copy auth-reveal auth-delay-1"><p>Start with a blank canvas.</p><h2>Make busywork<br/>run itself.</h2><div>Connect the tools you already use and build dependable workflows without waiting on engineering.</div></div>
      <div className="auth-quote auth-reveal auth-delay-2"><blockquote>“Our onboarding workflow went from a two-day handoff to twelve minutes.”</blockquote><div><i>MK</i><p><strong>Maya Kapoor</strong><span>Operations lead, Northstar</span></p></div></div>
      <div className="auth-metrics auth-reveal auth-delay-3"><div><strong>2.4m</strong><span>tasks this week</span></div><div><strong>99.99%</strong><span>platform uptime</span></div><div><strong>&lt; 1 min</strong><span>to first workflow</span></div></div>
    </section>
    <section className="auth-form-side auth-register-side">
      <div className="auth-mobile-top"><Link to="/" className="auth-brand"><BrandLogo/>AutomateX</Link></div>
      <div className="auth-form-wrap auth-reveal">
        <Link to="/" className="auth-back"><ArrowLeft/>Back to home</Link>
        <header className="auth-form-header"><span>Free forever plan</span><h1>Create your workspace</h1><p>No credit card. Set up takes less than a minute.</p></header>
        <div className="auth-social"><button onClick={()=>toast('Google sign up will be available soon.')}>G&nbsp;&nbsp; Continue with Google</button><button onClick={()=>toast('GitHub sign up will be available soon.')}>●&nbsp;&nbsp; GitHub</button></div>
        <div className="auth-divider"><span>or continue with email</span></div>
        <form onSubmit={handleSubmit(submit)} className="auth-form" noValidate>
          <Field label="Full name" error={errors.name?.message}><div className={`auth-input ${errors.name?'error':''}`}><User/><input autoComplete="name" placeholder="Your full name" {...register('name',{required:'Full name is required',minLength:{value:2,message:'Enter at least 2 characters'}})}/></div></Field>
          <Field label="Work email" error={errors.email?.message}><div className={`auth-input ${errors.email?'error':''}`}><Mail/><input type="email" autoComplete="email" placeholder="you@company.com" {...register('email',{required:'Email address is required',pattern:{value:/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,message:'Enter a valid email address'}})}/></div></Field>
          <Field label="Password" error={errors.password?.message} action={password&&<span>{score===3?'Strong':score===2?'Good':'Keep going'}</span>}><div className={`auth-input ${errors.password?'error':''}`}><LockKeyhole/><input type={visible?'text':'password'} autoComplete="new-password" placeholder="At least 8 characters" {...register('password',{required:'Password is required',minLength:{value:8,message:'Use at least 8 characters'}})}/><button type="button" className="auth-eye" onClick={()=>setVisible(!visible)}>{visible?<EyeOff/>:<Eye/>}</button></div>{password&&<><div className="auth-meter">{[1,2,3].map(n=><i key={n} className={score>=n?'on':''}/>)}</div><div className="auth-rules">{['8+ characters','Uppercase','Number'].map((r,i)=><span key={r} className={rules[i]?'met':''}><Check/>{r}</span>)}</div></>}</Field>
          <label className="auth-check auth-terms"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/><span>I agree to the <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.</span></label>
          <button className="auth-submit" disabled={loading}>{loading?<><i/>Creating workspace…</>:<>Create free workspace <ArrowRight/></>}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </section>
  </main>;
};
const Field=({label,error,action,children})=><div className="auth-field"><div className="auth-label"><label>{label}</label>{action}</div>{children}{error&&<small>{error}</small>}</div>;
