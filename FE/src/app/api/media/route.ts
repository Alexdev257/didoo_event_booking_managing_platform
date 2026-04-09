
import { NextResponse } from 'next/server';
import envconfig from '../../../config';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', file);
        cloudinaryFormData.append('upload_preset', envconfig.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        cloudinaryFormData.append('cloud_name', envconfig.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
        cloudinaryFormData.append('folder', 'EXE');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${envconfig.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: cloudinaryFormData,
            }
        );

        const data = await response.json();

        return NextResponse.json({
            isSuccess: true,
            message: 'Upload successful',
            statusCode: 200,
            data: data,
            listErrors: []
        });
    } catch (error: any) {
        console.error('Proxy upload error:', error);
        return NextResponse.json({
            isSuccess: false,
            message: error.message || 'Upload failed',
            statusCode: 500,
            data: null,
            listErrors: []
        }, { status: 500 });
    }
}
