"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { StoredTest, TestType, TestStatus } from "@/lib/data/sample-tests";

export default function TestsManagementPage() {
  const [tests, setTests] = useState<StoredTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tests?status=${statusFilter}&type=${typeFilter}`);
      const data = await res.json();
      if (data.tests) {
        setTests(data.tests);
      }
    } catch (err) {
      console.error("Failed to load tests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [statusFilter, typeFilter]);

  const handleUpdateStatus = async (id: string, newStatus: TestStatus) => {
    try {
      const res = await fetch(`/api/admin/tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActiveMenuId(null);
        fetchTests();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      const res = await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTests();
      }
    } catch (err) {
      console.error("Failed to delete test", err);
    }
  };

  // Filtered in-memory for search query
  const displayedTests = tests.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
  });

  // Aggregate stats
  const liveCount = tests.filter((t) => t.status === "Live").length;
  const publishedCount = tests.filter((t) => t.status === "Published").length;
  const reviewCount = tests.filter((t) => t.status === "Review").length;
  const draftCount = tests.filter((t) => t.status === "Draft").length;

  return (
    <div className="space-y-6 pb-16">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Layers className="w-6 h-6 text-sky-600" />
            <span>Test Builder Repository</span>
          </h1>
          <p className="text-xs text-slate-500">
            Publish and manage full CBT mocks, PYQs, and chapter drills for NEET 2027/2028 aspirants.
          </p>
        </div>

        <Link
          href="/admin/tests/create"
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Test</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            Live on CBT
          </span>
          <span className="text-2xl font-black text-emerald-600">{liveCount}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Active for students</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 block mb-1">
            Published Ready
          </span>
          <span className="text-2xl font-black text-sky-600">{publishedCount}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Scheduled for rollout</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
            In Review
          </span>
          <span className="text-2xl font-black text-purple-600">{reviewCount}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Answer key audit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
            Drafts
          </span>
          <span className="text-2xl font-black text-amber-600">{draftCount}</span>
          <span className="text-[10px] text-slate-400 block mt-1">In composition</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: "all", label: "All Tests" },
              { id: "live", label: "Live" },
              { id: "published", label: "Published" },
              { id: "review", label: "Review" },
              { id: "draft", label: "Draft" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition capitalize ${statusFilter === tab.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Test Type Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 text-[11px]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="all">All Types</option>
              <option value="Practice">Practice</option>
              <option value="Exam">Exam Simulation</option>
              <option value="PYQ">PYQ Past Paper</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test by name or keyword..."
            className="w-full text-xs p-3 pl-10 rounded-xl border border-slate-300 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

      </div>

      {/* Tests Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-xs">Loading tests repository...</p>
          </div>
        ) : displayedTests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-3">
            <p className="text-sm font-bold">No tests matched your filters.</p>
            <Link
              href="/admin/tests/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Test</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayedTests.map((test) => {
              const statusColor =
                test.status === "Live"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : test.status === "Published"
                    ? "bg-sky-100 text-sky-800 border-sky-300"
                    : test.status === "Review"
                      ? "bg-purple-100 text-purple-800 border-purple-300"
                      : "bg-amber-100 text-amber-800 border-amber-300";

              const typeBadge =
                test.type === "Exam"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : test.type === "Practice"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : test.type === "PYQ"
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : "bg-purple-50 text-purple-700 border-purple-200";

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

                    {/* Test Info */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge}`}>
                          {test.type}
                        </span>

                        {/* Status Pipeline Badge with Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === test.id ? null : test.id)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusColor}`}
                          >
                            <span>● {test.status}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>

                          {/* Quick Lifecycle Status Switcher */}
                          {activeMenuId === test.id && (
                            <div className="absolute left-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-30 text-xs animate-in fade-in">
                              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                                Set Status:
                              </span>
                              {(["Draft", "Review", "Published", "Live"] as TestStatus[]).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleUpdateStatus(test.id, st)}
                                  className={`w-full text-left px-2 py-1 rounded text-xs font-semibold hover:bg-slate-100 flex items-center justify-between ${test.status === st ? "text-sky-600 font-bold" : "text-slate-700"
                                    }`}
                                >
                                  <span>{st}</span>
                                  {test.status === st && <CheckCircle2 className="w-3 h-3 text-sky-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: {test.id}
                        </span>
                      </div>

                      <h3 className="font-black text-base text-slate-900 tracking-tight">
                        {test.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                        {test.description}
                      </p>
                    </div>

                    {/* Quick Metrics */}
                    <div className="flex sm:flex-col items-end gap-1.5 sm:text-right flex-shrink-0">
                      <div className="text-xs font-bold text-slate-800">
                        {test.config.totalQuestions} Questions • {test.config.totalQuestions * test.config.marksPerQuestion} Marks
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{test.config.durationMinutes} mins</span>
                      </div>
                    </div>

                  </div>

                  {/* Anti-cheat and config tags */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                      <span>Shuffling: <strong>{test.config.shuffleQuestions ? "Active" : "Off"}</strong></span>
                      <span>•</span>
                      <span>Review: <strong>{test.config.allowReview ? "Allowed" : "No"}</strong></span>
                      <span>•</span>
                      <span>Nav: <strong>{test.config.allowBackNavigation ? "Free" : "Linear"}</strong></span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href="/prototype/cbt-simulation.html"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Launch CBT Simulator</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Delete Test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
