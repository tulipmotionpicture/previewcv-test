"use client";

import Cropper from "react-easy-crop";
import { X } from "lucide-react";

interface ImageCropperProps {
  isOpen: boolean;
  imageSrc: string | null;
  crop: { x: number; y: number };
  zoom: number;
  aspect?: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  title?: string;
  confirmLabel?: string;
  maxZoom?: number;
  minZoom?: number;
  showGrid?: boolean;
}

export default function ImageCropper({
  isOpen,
  imageSrc,
  crop,
  zoom,
  aspect = 6 / 1,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onConfirm,
  onCancel,
  isProcessing = false,
  title = "Crop Image",
  confirmLabel = "Crop & Upload",
  maxZoom = 3,
  minZoom = 1,
  showGrid = true,
}: ImageCropperProps) {
  if (!isOpen || !imageSrc) {
    if (isOpen && !imageSrc) {
      console.warn("[ImageCropper] Modal is open but imageSrc is missing");
    }
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper */}
        <div
          className="relative w-full flex-1 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
          style={{
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={onCropChange}
              onCropComplete={onCropComplete}
              onZoomChange={onZoomChange}
              cropShape="rect"
              showGrid={showGrid}
              objectFit="contain"
              minZoom={minZoom}
              maxZoom={maxZoom}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>Loading image...</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.1}
              value={zoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-full"
              disabled={isProcessing}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
