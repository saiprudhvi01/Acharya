import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { requireAuth } from '@/lib/authMiddleware';

function isAllowedFileType(file: File, type: string) {
  const normalizedType = type.toLowerCase();
  const mime = file.type?.toLowerCase() || '';
  const name = file.name?.toLowerCase() || '';
  const extension = name.split('.').pop() || '';

  if (normalizedType === 'pdf') {
    return mime === 'application/pdf' || name.endsWith('.pdf') || extension === 'pdf';
  }

  if (normalizedType === 'video') {
    return ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'].includes(mime)
      || ['mp4', 'webm', 'mov', 'mkv'].includes(extension);
  }

  if (normalizedType === 'image') {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(mime)
      || ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
  }

  return ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mime)
    || ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx'].includes(extension);
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = auth.userId;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'video', 'pdf', 'image', 'material'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      pdf: ['application/pdf'],
      image: ['image/jpeg', 'image/png', 'image/webp'],
      material: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    };

    const allowedMimes = allowedTypes[type as keyof typeof allowedTypes] || allowedTypes.material;

    if (!isAllowedFileType(file, type) || (!allowedMimes.includes(file.type) && file.type !== 'application/octet-stream')) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}. Allowed types: ${allowedMimes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB for videos, 10MB for others)
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${type} is ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Store uploads in the public folder so they are accessible through the app URL.
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.name);
    const fileName = `${timestamp}-${randomString}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return a public URL that can be opened directly in the browser.
    const publicUrl = `/api/files/${type}/${fileName}`;

    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        url: publicUrl,
        fileName,
        size: file.size,
        type: file.type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
