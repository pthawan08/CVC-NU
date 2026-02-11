import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // เพิ่มขนาดรองรับ GIF ไฟล์ใหญ่
    },
  },
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, type } = request.body; // รับค่า type เพิ่ม (png หรือ gif)

    if (!image) {
      return response.status(400).json({ error: 'No image provided' });
    }

    // ตรวจสอบประเภทไฟล์
    const fileType = type === 'gif' ? 'gif' : 'png';
    const contentType = type === 'gif' ? 'image/gif' : 'image/png';

    // แปลง Base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // ตั้งชื่อไฟล์
    const filename = `photo-${Date.now()}.${fileType}`;

    // อัปโหลดขึ้น Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return response.status(200).json({ url: blob.url });

  } catch (error) {
    console.error("Upload Error:", error);
    return response.status(500).json({ error: 'Upload failed', details: error.message });
  }
}
