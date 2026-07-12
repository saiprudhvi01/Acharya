import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

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
    
    if (!allowedMimes.includes(file.type)) {
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

    // Create upload directory if it doesn't exist
    // Use /tmp for Render Free tier (files lost on each deployment)
    const baseDir = process.env.RENDER ? '/tmp' : path.join(process.cwd(), 'public');
    const uploadDir = path.join(baseDir, 'uploads', type);
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

    // Return the public URL (note: files in /tmp won't be accessible via public URL in production)
    const publicUrl = process.env.RENDER 
      ? `/uploads/${type}/${fileName}` // Files won't be accessible in Render Free tier
      : `/uploads/${type}/${fileName}`;

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
