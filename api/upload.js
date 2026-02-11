import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // เพิ่มขนาดให้รับรูปใหญ่ได้
    },
  },
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = request.body;

    if (!image) {
      return response.status(400).json({ error: 'No image provided' });
    }

    // แปลง Base64 กลับเป็น Binary Buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // ตั้งชื่อไฟล์ไม่ให้ซ้ำ (ใช้เวลาปัจจุบัน)
    const filename = `photo-${Date.now()}.png`;

    // อัปโหลดขึ้น Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png',
      // token: process.env.BLOB_READ_WRITE_TOKEN (Vercel ใส่ให้อัตโนมัติ)
    });

    // ส่งลิงก์กลับไปให้หน้าเว็บ
    return response.status(200).json({ url: blob.url });

  } catch (error) {
    console.error("Upload Error:", error);
    return response.status(500).json({ error: 'Upload failed', details: error.message });
  }
}
