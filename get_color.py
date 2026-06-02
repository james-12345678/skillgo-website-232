import urllib.request
from PIL import Image
import io

url = 'https://cdn.builder.io/api/v1/image/assets%2Fec09f543b5394959a6e88e0a7939e4a9%2F1e402648468b48fb9342e047c26acf37?format=webp&width=800&height=1200'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        img_data = response.read()
    img = Image.open(io.BytesIO(img_data))
    pixel = img.getpixel((10, 10))
    print('RGB:', pixel)
    print('HEX: #%02x%02x%02x' % pixel[:3])
except Exception as e:
    print('Error:', e)
