import https from 'https';
import { PNG } from 'pngjs';

const url = 'https://cdn.builder.io/api/v1/image/assets%2Fec09f543b5394959a6e88e0a7939e4a9%2F1e402648468b48fb9342e047c26acf37?format=png&width=100&height=100';

https.get(url, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    new PNG().parse(buffer, (error, data) => {
      if (error) {
        console.error('Error parsing PNG:', error);
        return;
      }
      // Get pixel at x=5, y=5
      const idx = (data.width * 5 + 5) << 2;
      const r = data.data[idx];
      const g = data.data[idx + 1];
      const b = data.data[idx + 2];
      const a = data.data[idx + 3];
      console.log(`RGB: rgb(${r}, ${g}, ${b}, ${a})`);
      console.log('HEX Color:', `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    });
  });
});
