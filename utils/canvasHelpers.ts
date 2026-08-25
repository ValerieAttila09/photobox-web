/**
 * Memotret frame video saat ini dan mengembalikannya sebagai Base64 Data URL
 */
export function captureVideoFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Mirroring horisontal agar hasil foto sesuai dengan tampilan mirror webcam
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

/**
 * Mengunduh gambar dari Konva Stage sebagai berkas PNG berkualitas tinggi (300 DPI)
 */
export function downloadCanvasImage(stageRef: any, filename = 'my-photobox.png') {
  if (!stageRef) return;

  const dataURL = stageRef.toDataURL({ pixelRatio: 3 }); // 3x pixelRatio untuk hasil high-res
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}