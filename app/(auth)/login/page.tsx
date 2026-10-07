"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail
} from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectUrl = redirectParam && redirectParam !== "/" ? redirectParam : "/dashboard";
  const isRegistered = searchParams.get("registered") === "true";
  const prefillEmail = searchParams.get("email") || "";

  // Form State
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Success -> Redirect to requested page or home
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMsg("An unexpected connection error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col md:flex-row font-sans">
      
      {/* Left Medical Canvas Banner (Dark Emerald matching theme) */}
      <div className="md:w-5/12 bg-[#06382c] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Logo */}
          <Link href="/" className="inline-flex items-center space-x-3 mb-10 group">
            <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg ring-2 ring-emerald-400/30">
              N
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-300 transition">
                NEETora
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Medical Entrance CBT
              </span>
            </div>
          </Link>

          <div className="space-y-4 max-w-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Aspirant Portal</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Welcome Back, Future Doctor.
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Continue your chapter-wise drills, full mock series, and personalized error analytics calibrated for NEET 2027 & 2028.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="my-8 space-y-3 border-y border-emerald-800/60 py-6">
          <div className="flex items-center gap-3 text-xs text-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>NTA Exact +4 / -1 Computer Based Test Simulator</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>NCERT Line-by-Line Question Bank with KaTeX Math</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Real-time All-India Percentile & Rank Predictor</span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 text-[11px] text-emerald-200/70">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Session • High-Security CBT Environment</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="md:w-7/12 flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to resume your test preparation.
            </p>
          </div>

          {/* Registration Success Alert */}
          {isRegistered && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account created successfully!</p>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  Please enter your password to access your Student Dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password *
                </label>
                <a href="#" className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  required
                  className="w-full text-xs p-3 pl-10 pr-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 select-none">
                Remember me on this browser (30 days)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#06382c] hover:bg-[#084a3b] text-white font-bold text-xs rounded-xl shadow-lg transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to NEETora</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              New to NEETora?{" "}
              <Link 
                href={redirectUrl !== "/" ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"} 
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Register for NEET 2027/2028 &rarr;
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
