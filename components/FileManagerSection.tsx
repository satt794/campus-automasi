"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  uploadCampusFile,
  fetchUserFiles,
  getDownloadFileUrl,
  deleteUserFile,
  StorageFile,
  ALLOWED_EXTENSIONS,
} from "@/lib/storage";
import {
  UploadCloud,
  FileText,
  Presentation,
  Download,
  Trash2,
  FileCheck,
  AlertCircle,
  HardDrive,
} from "lucide-react";

interface FileManagerSectionProps {
  userId: string | undefined;
}

export function FileManagerSection({ userId }: FileManagerSectionProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchUserFiles(userId);
      setFiles(data);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !userId) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploading(true);

    try {
      await uploadCampusFile(userId, selectedFile);
      setSuccessMsg(`File "${selectedFile.name}" berhasil diunggah!`);
      await loadFiles();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal mengunggah file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    if (!userId) return;
    try {
      const url = await getDownloadFileUrl(userId, fileName);
      window.open(url, "_blank");
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Gagal mengambil link unduhan: ${error.message}`);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!userId) return;
    if (!confirm(`Hapus file "${fileName}" secara permanen?`)) return;

    try {
      await deleteUserFile(userId, fileName);
      setFiles((prev) => prev.filter((f) => f.name !== fileName));
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Gagal menghapus file: ${error.message}`);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    return <Presentation className="w-5 h-5 text-amber-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-";
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone / Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.ppt,.pptx"
          onChange={handleFileUpload}
          className="hidden"
          id="campus-file-upload"
          disabled={isUploading}
        />

        <label
          htmlFor="campus-file-upload"
          className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            {isUploading ? "Sedang Mengunggah Dokumen..." : "Klik untuk Unggah Berkas Kuliah"}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Mendukung berkas presentasi dan materi perkuliahan bertipe:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              .PDF, .PPT, .PPTX
            </span>{" "}
            (Maksimal 50MB per file).
          </p>
        </label>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs text-left">
            <FileCheck className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Berkas Tersimpan</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total: {files.length} File
          </span>
        </h3>

        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-10 text-sm text-slate-400">
              Memuat berkas dari Supabase Storage...
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400">
              Belum ada berkas materi kuliah yang diunggah.
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-xs">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {file.name.replace(/^\d+_/, "")}
                    </h5>
                    <span className="text-xs text-slate-400">
                      {formatFileSize(file.metadata?.size)} •{" "}
                      {file.created_at
                        ? new Date(file.created_at).toLocaleDateString("id-ID")
                        : "Hari ini"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(file.name)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Unduh Berkas"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Hapus Berkas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
