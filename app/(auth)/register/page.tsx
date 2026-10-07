"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Target, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles
} from "lucide-react";

export default function StudentRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const targetRedirect = redirectParam && redirectParam !== "/" ? redirectParam : "/dashboard";

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [targetYear, setTargetYear] = useState<number>(2027);
  const [targetScore, setTargetScore] = useState<number>(680);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          targetYear,
          targetScore,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      // Success -> Redirect to Login with success flag and pre-filled email
      router.push(`/login?registered=true&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(targetRedirect)}`);
    } catch {
      setErrorMsg("Network error occurred during registration.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      
      {/* Left Column: Inspiring Medical Hero Banner (Learn@House Style) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#06382c] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Logo */}
        <div className="flex items-center space-x-3 z-10">
          <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">
            N
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">NEETora</span>
            <span className="text-[10px] font-bold text-emerald-300 block -mt-1">
              Medical Entrance Prep
            </span>
          </div>
        </div>

        {/* Center Inspiration Card */}
        <div className="space-y-6 z-10 max-w-sm">
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-500/40 shadow-2xl mx-auto bg-[#03221b]">
            <img
              src="/images/neet-hero-student.jpg"
              alt="Medical Student Hero"
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Start Your Medical Journey
            </h2>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              Create your account to unlock full-length NTA NEET mock tests, automated Mistake Book tracking, and detailed KaTeX solutions.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-emerald-100/90 pt-2 border-t border-emerald-700/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full 180 Qs CBT Mock Simulations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Automatic Negative Mark Diagnoser</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>15,000+ NCERT Verified Question Bank</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-emerald-300/50 z-10">
          © NEETora Academic Systems. All Rights Reserved.
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          
          <div className="space-y-1">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Medical Aspirant Profile
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Your Free Account
            </h1>
            <p className="text-xs text-slate-500">
              Join thousands of serious aspirants preparing for NEET 2027 & 2028.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Jayant Jain"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Create Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters..."
                  required
                  minLength={6}
                  className="w-full text-xs p-3 pr-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Target NEET Year (2027, 2028, 2029...) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target NEET Examination Year *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2027, 2028, 2029, 2030].map((yr) => (
                  <button
                    type="button"
                    key={yr}
                    onClick={() => setTargetYear(yr)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      targetYear === yr
                        ? "bg-[#06382c] text-white border-[#06382c] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    NEET {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Score */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Score (out of 720)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[650, 680, 700].map((score) => (
                  <button
                    type="button"
                    key={score}
                    onClick={() => setTargetScore(score)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      targetScore === score
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    🎯 {score}+
                  </button>
                ))}
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 transform active:scale-95"
            >
              {loading ? (
                <span>Creating Your Profile...</span>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Already have an account - Bottom of Form */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link 
                href={`/login?redirect=${encodeURIComponent(targetRedirect)}`}
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Sign In &rarr;
              </Link>
            </p>
          </div>

          {/* Privacy Note */}
          <p className="text-[11px] text-slate-400 text-center">
            By creating an account, you agree to our Terms of Academic Preparation.
          </p>

        </div>
      </div>

    </div>
  );
}
