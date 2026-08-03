import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Zap, Mail, Lock } from 'lucide-react';

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none relative overflow-hidden font-sans">
      <div className="w-full max-w-md">
        <Card className="space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center">
                <Zap className="w-6 h-6 fill-indigo-400" />
              </div>
            </Link>
            <h2 className="text-xl font-bold text-white tracking-tight">Sign in to AutomateX</h2>
            <p className="text-xs text-slate-400">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="engineer@company.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <span
                  title="Password reset feature is coming soon"
                  className="text-[11px] text-slate-600 cursor-not-allowed select-none"
                >
                  Forgot Password?
                </span>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
