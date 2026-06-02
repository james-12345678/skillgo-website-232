import { useEffect, useState } from "react";

interface TransparentLogoProps {
  src: string;
  className?: string;
  alt?: string;
}

export const TransparentLogo = ({ src, className, alt }: TransparentLogoProps) => {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample background color from the corners
      // We sample 4 corners and average them to get a robust background estimate
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];

      let totalR = 0, totalG = 0, totalB = 0;
      for (const [x, y] of corners) {
        const idx = (y * canvas.width + x) * 4;
        totalR += data[idx];
        totalG += data[idx + 1];
        totalB += data[idx + 2];
      }

      const bgR = totalR / 4;
      const bgG = totalG / 4;
      const bgB = totalB / 4;

      // Chroma-key background removal with smooth edge feathering
      const maxThreshold = 65; // pixels with distance < maxThreshold will be modified
      const minThreshold = 25; // pixels with distance < minThreshold will be fully transparent

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB color space
        const dist = Math.sqrt(
          (r - bgR) ** 2 +
          (g - bgG) ** 2 +
          (b - bgB) ** 2
        );

        if (dist < minThreshold) {
          data[i + 3] = 0; // Fully transparent
        } else if (dist < maxThreshold) {
          // Linear interpolation for feathering/anti-aliasing
          const ratio = (dist - minThreshold) / (maxThreshold - minThreshold);
          data[i + 3] = Math.round(ratio * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedSrc(canvas.toDataURL());
    };
  }, [src]);

  return <img src={processedSrc} className={className} alt={alt} />;
};

export default TransparentLogo;
