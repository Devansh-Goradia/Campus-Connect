"use client";

import { useState, useCallback } from "react";
import { Upload, Camera, CheckCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface IdUploaderProps {
  onUpload: (file: File) => Promise<void>;
}

export function IdUploader({ onUpload }: IdUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      setUploading(true);
      await onUpload(file);
      setUploading(false);
      setDone(true);
    },
    [onUpload]
  );

  return (
    <div className="w-full space-y-3">
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={clsx(
          "relative flex flex-col items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden",
          dragOver
            ? "border-neon-cyan bg-neon-cyan/10 scale-[1.01]"
            : "border-surface-border bg-surface-muted hover:border-neon-cyan/50 hover:bg-neon-cyan/5",
          done && "border-neon-green/50 bg-neon-green/5"
        )}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {/* Preview image */}
        {preview && (
          <img
            src={preview}
            alt="ID preview"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}

        <div className="relative z-10 flex flex-col items-center gap-2 text-center px-6">
          {done ? (
            <>
              <CheckCircle className="h-10 w-10 text-neon-green" />
              <p className="text-sm font-semibold text-neon-green">ID Uploaded!</p>
              <p className="text-xs text-white/50">Pending admin verification</p>
            </>
          ) : uploading ? (
            <>
              <Loader2 className="h-10 w-10 text-neon-cyan animate-spin" />
              <p className="text-sm font-semibold text-neon-cyan">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <Upload className="h-8 w-8 text-white/40" />
                <Camera className="h-8 w-8 text-white/40" />
              </div>
              <p className="text-sm font-semibold text-white/80">
                Drop your Campus ID or click to upload
              </p>
              <p className="text-xs text-white/40">
                JPG, PNG · Max 5MB · Used only for verification
              </p>
            </>
          )}
        </div>
      </label>

      {/* Security note */}
      <p className="text-center text-xs text-white/30 flex items-center justify-center gap-1">
        <span>🔒</span>
        Your ID is encrypted and only viewed by our admin for verification. Never shared.
      </p>
    </div>
  );
}
