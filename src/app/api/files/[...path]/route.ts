import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean);
    const filePathSegments = segments.slice(2);

    if (filePathSegments.length < 2) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const [type, ...fileNameParts] = filePathSegments;
    const fileName = fileNameParts.join('/');
    const absolutePath = path.join(process.cwd(), 'public', 'uploads', type, fileName);

    if (!existsSync(absolutePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();

    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.mkv': 'video/x-matroska',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
