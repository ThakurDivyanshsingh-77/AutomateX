import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  File,
  Info,
} from 'lucide-react';
import { fileService } from '../../../../services/fileService';
import toast from 'react-hot-toast';

const ALLOWED_EXTENSIONS = ['.docx', '.doc', '.pdf', '.xlsx', '.xls'];
const MAX_SIZE_MB = 25;

export const FileUploadProperties = ({ node, onUpdateNodeData }) => {
  const config = node.data?.config || {};
  const file = config.file || null;
  const fileId = config.fileId || file?.id || null;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');

  const fileInputRef = useRef(null);

  const validateClientFile = (selectedFile) => {
    setValidationError('');

    if (!selectedFile) {
      setValidationError('No file selected.');
      return false;
    }

    const name = selectedFile.name || '';
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError(
        `Unsupported extension "${ext}". Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`
      );
      return false;
    }

    const maxBytes = MAX_SIZE_MB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setValidationError(
        `File size (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of ${MAX_SIZE_MB} MB.`
      );
      return false;
    }

    return true;
  };

  const handleFileUpload = async (selectedFile) => {
    if (!validateClientFile(selectedFile)) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setValidationError('');

      const result = await fileService.uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (result?.success && result?.file) {
        const uploadedFile = result.file;

        onUpdateNodeData(node.id, {
          config: {
            ...config,
            fileId: uploadedFile.id,
            file: uploadedFile,
          },
        });

        toast.success(`Successfully uploaded ${uploadedFile.name}`);
      } else {
        throw new Error('Server returned invalid file upload response.');
      }
    } catch (err) {
      console.error('[FileUploadProperties] Upload error:', err);
      const errMsg =
        err.response?.data?.error?.message || err.message || 'The document could not be uploaded.';
      setValidationError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = async () => {
    if (fileId) {
      try {
        await fileService.deleteFile(fileId);
      } catch (e) {
        // Ignore deletion errors on server if already cleaned
      }
    }

    onUpdateNodeData(node.id, {
      config: {
        ...config,
        fileId: null,
        file: null,
      },
    });

    setValidationError('');
    toast.success('Document removed');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getExtBadge = (extension, mimeType) => {
    let ext = (extension || '').replace('.', '').toUpperCase();
    if (!ext && mimeType) {
      if (mimeType.includes('word')) ext = 'DOCX';
      else if (mimeType.includes('pdf')) ext = 'PDF';
      else if (mimeType.includes('sheet') || mimeType.includes('excel')) ext = 'XLSX';
    }
    return ext || 'DOCX';
  };

  return (
    <div className="space-y-4">
      {/* Node Description */}
      <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-1">
        <h4 className="text-xs font-semibold text-slate-200">Upload Document</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Upload a document that will be passed to the next workflow step.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.doc,.pdf,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Validation Error Alert Banner */}
      {validationError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-[11px]">Upload Error</span>
            <p className="text-[11px] opacity-90 leading-tight">{validationError}</p>
          </div>
        </div>
      )}

      {/* ─── State 1: Uploading State ─── */}
      {isUploading && (
        <div className="p-5 border-2 border-dashed border-blue-500/50 rounded-xl bg-blue-500/5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-medium">Uploading document... ({uploadProgress}%)</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-blue-500 h-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ─── State 2: Uploaded State ─── */}
      {!isUploading && file && (
        <div className="p-3.5 border border-slate-800 rounded-xl bg-slate-900/90 space-y-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <h5 className="text-xs font-bold text-slate-100 truncate">
                  {file.name || file.originalName}
                </h5>
              </div>

              <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                  {getExtBadge(file.extension, file.mimeType)}
                </span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Replace</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveFile}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── State 3: Empty / Dropzone State ─── */}
      {!isUploading && !file && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-blue-500/50 bg-slate-900/60 hover:bg-slate-900'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 mb-1">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-xs font-semibold text-slate-200">
              Drag & drop your file
            </p>
            <p className="text-[11px] text-slate-500">or</p>

            <button
              type="button"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </button>

            <div className="pt-3 border-t border-slate-800/80 w-full mt-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                DOCX • DOC • PDF • XLSX • XLS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Format Policy Note */}
      <div className="flex items-start gap-2 p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 text-[10px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <span>
          DOCX is the primary supported format for Phase 2 product extraction. Maximum upload limit is {MAX_SIZE_MB} MB.
        </span>
      </div>
    </div>
  );
};
