import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

const VerifyEmail = () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const clientUrl = (import.meta.env.VITE_CLIENT_URL && import.meta.env.VITE_CLIENT_URL !== 'undefined' && import.meta.env.VITE_CLIENT_URL !== 'null')
    ? import.meta.env.VITE_CLIENT_URL
    : (isLocal ? 'http://localhost:5173' : 'https://tauhidshekhar.vercel.app');

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const { token } = useParams();

  useEffect(() => {
    const doVerification = async () => {
      try {
        const res = await api.verifyEmail(token);
        if (res.success) {
          setStatus('success');
          setMessage(res.message || 'Email verified successfully!');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification link is invalid or expired.');
      }
    };

    if (token) {
      doVerification();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-blue/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary-purple/10 blur-[100px] pointer-events-none" />

      <div className="glass p-8 md:p-10 rounded-[30px] border border-slate-200/60 dark:border-white/5 shadow-xl w-full max-w-[420px] relative z-10 text-center">
        
        {/* Back Link */}
        <div className="text-left mb-6">
          <a href={clientUrl} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-blue transition-colors">
            <FaArrowLeft /> Back to Website
          </a>
        </div>
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
            <h3 className="text-lg font-bold font-title text-black dark:text-white">Verifying Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Please wait while we verify your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-500 text-2xl font-bold">✓</div>
            <h3 className="text-xl font-bold font-title text-black dark:text-white">Email Verified!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{message}</p>
            <Link to="/admin/login" className="px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold font-title mt-4 shadow-lg shadow-primary-blue/15 transition-all">
              Sign In to CMS
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 text-2xl font-bold">✕</div>
            <h3 className="text-xl font-bold font-title text-black dark:text-white">Verification Failed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{message}</p>
            <Link to="/admin/login" className="px-8 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold font-title mt-4 transition-all">
              Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
