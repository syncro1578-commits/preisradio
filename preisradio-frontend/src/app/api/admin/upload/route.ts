import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { checkAuth } from '@/lib/auth';

// POST /api/admin/upload — upload image to Cloudinary
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Cloudinary
  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'preisradio/blog',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 450, crop: 'fill', quality: 'auto', format: 'webp' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; public_id: string });
        }
      )
      .end(buffer);
  });

  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
  });
}
