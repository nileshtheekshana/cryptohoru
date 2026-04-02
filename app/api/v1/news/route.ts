import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/lib/apiAuth';
import clientPromise from '@/lib/mongodb-client';
import { processBase64Image } from '@/lib/imageProcessor';

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const validation = await validateAPIKey(request, 'create:news');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      image,
      imageUrl,
      author,
      source,
      sourceUrl,
      category,
      tags,
      published,
      slug,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('cryptohoru');

    // Generate slug if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if slug exists
    const existing = await db.collection('news').findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json(
        { error: 'A news article with this slug already exists' },
        { status: 409 }
      );
    }

    const finalImage = await processBase64Image(image);
    const finalImageUrl = await processBase64Image(imageUrl);

    const newNews = {
      title,
      content,
      image: finalImage || '',
      imageUrl: finalImageUrl || '',
      author: author || 'CryptoHoru Team',
      source: source || '',
      sourceUrl: sourceUrl || '',
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      published: published !== undefined ? published : true,
      views: 0,
      slug: finalSlug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('news').insertOne(newNews);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        slug: finalSlug,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/news/${finalSlug}`,
      },
    });
  } catch (error) {
    console.error('Error creating news via API:', error);
    return NextResponse.json(
      { error: 'Failed to create news article' },
      { status: 500 }
    );
  }
}
