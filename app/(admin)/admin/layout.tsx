import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  HelpCircle,
  PlusCircle,
  CheckSquare,
  FileUp,
  Layers,
  ArrowLeft,
  Settings
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white shadow-inner">
            <Link href="/admin">N</Link>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">NEETora Admin</span>
              <span className="text-[10px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                Admin Console
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Content & Question Bank Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition px-3 py-1.5 rounded-md hover:bg-slate-800 border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Student View
          </Link>
          <div className="h-7 w-7 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center justify-center border border-sky-500">
            A
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Left Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between p-4 hidden md:flex flex-shrink-0">
          <nav className="space-y-1 text-xs font-medium">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
              Question Management
            </div>

            <Link
              href="/admin/questions"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              Question Bank
            </Link>

            <Link
              href="/admin/questions/create"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Create Question
            </Link>

            <Link
              href="/admin/questions/review"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <CheckSquare className="w-4 h-4 text-purple-400" />
              Review Queue
              <span className="ml-auto bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                0
              </span>
            </Link>

            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2 pt-4">
              Ingestion & Tests
            </div>

            <Link
              href="/admin/pdfs"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <FileUp className="w-4 h-4 text-amber-400" />
              PDF Extraction
            </Link>

            <Link
              href="/admin/tests"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              Test Builder
            </Link>
          </nav>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              System Status
            </div>
            <p>Database: <span className="text-emerald-400 font-medium">Ready</span></p>
            <p>Questions Active: <span className="text-slate-200 font-bold">5 sample</span></p>
          </div>
        </aside>

        {/* Admin Main Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
