import imageCompression from 'browser-image-compression';

const DEFAULT_OPTIONS = {
  maxSizeMB: 1.5,           // Bumping to 1.5MB for "Luxury" sharpness
  maxWidthOrHeight: 3840,  // Ultra-sharp for 4K/Retina displays
  useWebWorker: true,      
  initialQuality: 0.95,     
};

/**
 * Compresses a single image file while maintaining high quality.
 */
export async function compressImage(file: File) {
  if (!file || file.size === 0) return file;
  
  // Skip if it's already reasonably small
  if (file.size < 300 * 1024) return file;

  try {
    return await imageCompression(file, DEFAULT_OPTIONS);
  } catch (error) {
    console.error("Image compression failed, using original:", error);
    return file;
  }
}

/**
 * Compresses multiple image files in parallel.
 */
export async function compressMultipleImages(files: File[]) {
  return Promise.all(files.map(file => compressImage(file)));
}
