import { useState, useCallback } from "react";

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseImageCropperOptions {
  maxFileSizeMB?: number;
  onError?: (error: string) => void;
}

export const useImageCropper = (options: UseImageCropperOptions = {}) => {
  const { maxFileSizeMB = 1, onError } = options;

  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CroppedAreaPixels | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMB) {
        const errorMsg = `File size must be less than ${maxFileSizeMB}MB`;
        onError?.(errorMsg);
        return false;
      }

      // Read file and show cropper
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
        resetCropState();
      };
      reader.onerror = () => {
        const errorMsg = "Failed to read file";
        onError?.(errorMsg);
      };
      reader.readAsDataURL(file);
      return true;
    },
    [maxFileSizeMB, onError],
  );

  const handleCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const resetCropState = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  const closeCropper = useCallback(() => {
    setShowCropper(false);
    setImageToCrop(null);
    resetCropState();
  }, [resetCropState]);

  const getCroppedImage = async (): Promise<File | null> => {
    if (!imageToCrop || !croppedAreaPixels) {
      onError?.("No image to crop");
      return null;
    }

    setIsProcessing(true);
    try {
      const image = new window.Image();
      image.src = imageToCrop;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        onError?.("Failed to get canvas context");
        return null;
      }

      // Set canvas dimensions based on cropped area
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw the cropped image
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "cropped-image.jpg", {
              type: "image/jpeg",
            });
            resolve(file);
          } else {
            onError?.("Failed to create image blob");
            resolve(null);
          }
        }, "image/jpeg");
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Error cropping image";
      onError?.(errorMsg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    // State
    showCropper,
    imageToCrop,
    crop,
    zoom,
    croppedAreaPixels,
    isProcessing,

    // Actions
    handleFileSelect,
    handleCropComplete,
    getCroppedImage,
    closeCropper,
    resetCropState,

    // Setters
    setCrop,
    setZoom,
    setImageToCrop,
    setShowCropper,
  };
};
