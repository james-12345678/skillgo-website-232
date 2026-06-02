import https from 'https';

const url = 'https://cdn.builder.io/api/v1/image/assets%2Fec09f543b5394959a6e88e0a7939e4a9%2F1e402648468b48fb9342e047c26acf37?format=png&width=10&height=10';

https.get(url, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log('PNG Length:', buffer.length);
    // Print PNG header and chunks
    let pos = 8; // skip signature
    while (pos < buffer.length) {
      if (pos + 8 > buffer.length) break;
      const length = buffer.readUInt32BE(pos);
      const type = buffer.toString('ascii', pos + 4, pos + 8);
      console.log(`Chunk: ${type}, Length: ${length}`);
      if (type === 'PLTE') {
        const r = buffer[pos + 8];
        const g = buffer[pos + 9];
        const b = buffer[pos + 10];
        console.log(`PLTE palette entry 0: rgb(${r}, ${g}, ${b}) -> #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
      }
      pos += 12 + length;
    }
  });
});
