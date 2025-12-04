"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  label: string;
  currentImage?: string | null;
  folder: "logos" | "banners";
  onFileSelect?: (file: File) => void; 
  onRemove?: () => void;
  aspectRatio?: "square" | "wide";
}

export default function ImageUpload({
  label,
  currentImage,
  folder,
  onFileSelect,
  onRemove,
  aspectRatio = "square",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent component about the file (for later upload)
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(currentImage || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2 text-center md:text-left">
      <label className="block text-sm text-center font-medium text-gray-700">
        {label}
      </label>

      <div
        className={`
          relative border-2 border-dashed rounded-lg overflow-hidden mx-auto
          ${aspectRatio === "square" ? "w-full max-w-xs aspect-square" : "w-full aspect-video"}
          ${error ? "border-red-300" : "border-gray-300"}
          transition-colors cursor-pointer hover:border-gray-400
        `}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-xs text-center px-2">
              Click to upload
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-center text-gray-500">
        Recommended: {aspectRatio === "square" ? "Square" : "Wide"} image,
        max 5MB (JPEG, PNG, WebP)
      </p>

    </div>
  );
}

