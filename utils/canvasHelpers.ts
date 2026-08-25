import type { Stage } from 'konva/lib/Stage';

/**
 * Memotret frame video saat ini dan mengembalikannya sebagai Base64 Data URL
 */
export function captureVideoFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  const sourceWidth = video.videoWidth || 1280;
  const sourceHeight = video.videoHeight || 720;
  const targetWidth = Math.min(sourceWidth, 1200);
  const targetHeight = Math.round(targetWidth * 4 / 3);
  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = 3 / 4;
  const cropWidth = sourceAspect > targetAspect
    ? sourceHeight * targetAspect
    : sourceWidth;
  const cropHeight = sourceAspect > targetAspect
    ? sourceHeight
    : sourceWidth / targetAspect;
  const cropX = (sourceWidth - cropWidth) / 2;
  const cropY = (sourceHeight - cropHeight) / 2;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Mirroring horisontal agar hasil foto sesuai dengan tampilan mirror webcam
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

/**
 * Mengunduh gambar dari Konva Stage sebagai berkas PNG berkualitas tinggi (300 DPI)
 */
export function downloadCanvasImage(stageRef: Stage | null, filename = 'my-photobox.png') {
  if (!stageRef) return;

  const dataURL = stageRef.toDataURL({ pixelRatio: 3 }); // 3x pixelRatio untuk hasil high-res
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}