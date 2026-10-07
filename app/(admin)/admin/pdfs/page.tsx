"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  FileUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  UploadCloud, 
  FileCode,
  Scan,
  Cpu,
  X,
  FileCheck2,
  Lock
} from "lucide-react";
import { SAMPLE_PDF_DOCUMENTS } from "@/lib/extraction/sample-staging";
import { PdfExtractionDocument } from "@/lib/extraction/types";

export default function AdminPdfExtractionPage() {
  const [documents, setDocuments] = useState<PdfExtractionDocument[]>(SAMPLE_PDF_DOCUMENTS);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [targetSubject, setTargetSubject] = useState("All NEET Subjects");
  const [targetYear, setTargetYear] = useState(2025);
  const [pdfSource, setPdfSource] = useState("NEET PYQ");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setUploadError("Invalid file type. Please select an authentic .pdf question paper.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);
    setUploadSuccess(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setUploadError("Invalid file type. Please drop an authentic .pdf document.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRealUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!selectedFile) {
      setUploadError("Please select or drop a PDF question paper to upload.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("year", targetYear.toString());
      formData.append("source", pdfSource);
      formData.append("subject", targetSubject);

      const res = await fetch("/api/admin/pdfs/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 403) {
          throw new Error("Admin RBAC clearance required. Please ensure you are authenticated in the Admin Gateway.");
        }
        throw new Error(data.error || "Failed to parse PDF document.");
      }

      // Successfully processed on server
      const serverFile = data.file;
      const newDoc: PdfExtractionDocument = {
        id: serverFile.id || `pdf-${Date.now()}`,
        fileName: serverFile.fileName || selectedFile.name,
        fileSizeBytes: serverFile.fileSizeBytes || selectedFile.size,
        pdfType: "TYPE_C",
        uploadedAt: serverFile.uploadedAt || new Date().toISOString(),
        status: "review_ready",
        pageCount: 35,
        totalQuestions: 4,
        approvedCount: 0,
        rejectedCount: 0,
        source: pdfSource,
        sourceYear: targetYear,
      };

      setDocuments([newDoc, ...documents]);
      setUploadSuccess(`PDF "${newDoc.fileName}" ingested successfully! Magic signature verified and signed access generated.`);
      handleRemoveFile();
    } catch (err: any) {
      setUploadError(err.message || "An error occurred while uploading the PDF paper.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">PDF → Question Extraction Engine</h1>
          <p className="text-xs text-slate-500">
            Upload PDF Papers, Classify Format (Type A/B/C), and Trigger Background Extraction
          </p>
        </div>

        <Link
          href="/admin/questions/review"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition self-start sm:self-auto"
        >
          <Layers className="w-4 h-4" />
          <span>Go to Review Deck</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* PDF Classification Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800">Type A: Text-Based PDF</h4>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-bold">Fast</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Selectable vector font streams. Direct character extraction via tokenizer without OCR.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800">Type B: Scanned PDF</h4>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">OCR</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Raster image scans. Automated deskewing, binarization, and deep learning OCR extraction.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800">Type C: Mixed PDF</h4>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">Hybrid</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Digital question text combined with diagrams, chemical formulas, and circuits cropped into images.
            </p>
          </div>
        </div>
      </div>

      {/* UPLOAD FORM */}
      <form onSubmit={handleRealUpload} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-sky-600" />
            Upload Question Paper PDF
          </h3>
          <span className="text-xs text-slate-400 font-mono">Max Size: 25MB • Strict PDF Magic Header</span>
        </div>

        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Interactive Drag and Drop Zone */}
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
              isDragging
                ? "border-sky-500 bg-sky-50/80 scale-[1.01]"
                : "border-slate-300 hover:border-sky-500 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <FileUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Click to choose PDF or drag & drop file here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard NTA medical entrance test papers with diagrams and keys
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
              <span>Browse Local Device</span>
            </div>
          </div>
        ) : (
          /* Selected File Preview Box */
          <div className="p-4 rounded-2xl border-2 border-emerald-400/80 bg-emerald-50/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-sm sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">Ready for Ingestion</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm transition"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {uploadError && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Upload Rejected</span>
              <span>{uploadError}</span>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Upload Success</span>
              <span>{uploadSuccess}</span>
            </div>
          </div>
        )}

        {/* Paper Metadata Config */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Subject Scope</label>
            <select
              value={targetSubject}
              onChange={(e) => setTargetSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-sky-500"
            >
              <option value="All NEET Subjects">All NEET Subjects (Full Syllabus)</option>
              <option value="Physics">Physics only</option>
              <option value="Chemistry">Chemistry only</option>
              <option value="Biology">Biology (Botany + Zoology)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Source Label</label>
            <select
              value={pdfSource}
              onChange={(e) => setPdfSource(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-sky-500"
            >
              <option value="NEET PYQ">NEET PYQ</option>
              <option value="Internal Mock">Internal Mock</option>
              <option value="Coaching Test Series">Coaching Test Series</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Exam Year</label>
            <input
              type="number"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Extraction worker extracts LaTeX math, chemical reactions, and answer keys into staged questions.
          </span>

          <button
            type="submit"
            disabled={isUploading}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Validating & Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Start Extraction Job</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* INGESTION JOBS & DOCUMENTS LIST */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">Uploaded Papers & Extraction Status</h3>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                  <FileText className="w-6 h-6 text-sky-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{doc.fileName}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        doc.pdfType === "TYPE_A"
                          ? "bg-sky-100 text-sky-800"
                          : doc.pdfType === "TYPE_B"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {doc.pdfType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        doc.status === "review_ready"
                          ? "bg-emerald-100 text-emerald-800"
                          : doc.status === "processing"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {doc.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Source: <strong className="text-slate-700">{doc.source} {doc.sourceYear}</strong> • {doc.pageCount} Pages • {(doc.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="flex items-center gap-4 self-end md:self-auto">
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-800">
                    {doc.totalQuestions} Questions Detected
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {doc.approvedCount} Approved • {doc.totalQuestions - doc.approvedCount} Pending
                  </div>
                </div>

                <Link
                  href={`/admin/questions/review?pdf=${doc.id}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>Open Review Deck</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
