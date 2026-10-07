import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-12 w-12 bg-sky-50 text-sky-600 rounded-xl mx-auto flex items-center justify-center font-bold text-lg">
          404
        </div>
        <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested page or test module does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
