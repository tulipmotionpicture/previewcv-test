import QRCode from "qrcode";
import { toPng } from "html-to-image";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generates a Data URL (base64 string) for a given text using QRCode.
 * @param text The text or URL to encode in the QR code
 * @param options Styling options for the QR code
 * @returns A promise that resolves to the Data URL
 */
export const generateQRCodeDataURL = async (
  text: string,
  options: QRCodeOptions = {
    width: 400,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  },
): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, options);
  } catch (error) {
    console.error("Error generating QR Code Data URL:", error);
    throw error;
  }
};

/**
 * Captures a DOM element and downloads it as an image file.
 * @param elementId The ID of the HTML element to capture
 * @param filename The name of the file to save (e.g., 'card.png')
 * @param scale The quality/scale of the downloaded image (default: 3)
 */
export const downloadElementAsImage = async (
  elementId: string,
  filename: string,
  scale: number = 3,
): Promise<void> => {
  const cardElement = document.getElementById(elementId);
  if (!cardElement) {
    console.warn(`Element with id "${elementId}" not found for download.`);
    return;
  }

  try {
    const dataUrl = await toPng(cardElement, {
      cacheBust: true,
      pixelRatio: scale,
      backgroundColor: "transparent",
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to capture and download element:", error);
    throw error;
  }
};
