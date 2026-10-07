"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, masterKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Security Clearance Verified! Opening Admin Console...");
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch {
      setErrorMsg("Network error during security clearance.");
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@neetora.internal");
    setMasterKey("neetora@admin2027");
  };

  return (
    <div className="min-h-screen bg-[#031510] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background ambient security grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#053c2f_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#05231b] border-2 border-emerald-800/80 rounded-2xl shadow-2xl p-8 space-y-6 relative z-10 backdrop-blur-xl">
        
        {/* Vault Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            NEETora Admin Gateway
          </h1>
          <p className="text-xs text-emerald-200/60 font-medium">
            Restricted Access: Authorized Examination Staff & Content Directors Only
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/70 border border-rose-600/50 rounded-xl text-xs text-rose-200 flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-600/50 rounded-xl text-xs text-emerald-200 flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Secret Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Administrator Email / Identifier
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@neetora.internal"
              required
              className="w-full text-xs p-3 rounded-xl bg-[#031913] border border-emerald-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Master Security Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="••••••••••••••••"
                required
                className="w-full text-xs p-3 pr-10 rounded-xl bg-[#031913] border border-emerald-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-white placeholder-slate-500 outline-none transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 transform active:scale-95"
          >
            {loading ? (
              <span>Verifying Security Clearance...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Authenticate & Unlock Console ➔
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Need rapid testing credentials?</span>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline"
          >
            Auto-fill Master Key
          </button>
        </div>

      </div>

    </div>
  );
}
