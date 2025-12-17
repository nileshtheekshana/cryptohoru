import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/lib/apiAuth';
import clientPromise from '@/lib/mongodb-client';

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const validation = await validateAPIKey(request, 'create:blog');
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
      excerpt,
      image,
      imageUrl,
      author,
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
    const existing = await db.collection('blogs').findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists' },
        { status: 409 }
      );
    }

    const newBlog = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      image: image || '',
      imageUrl: imageUrl || '',
      author: author || 'CryptoHoru Team',
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      published: published !== undefined ? published : true,
      views: 0,
      slug: finalSlug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('blogs').insertOne(newBlog);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        slug: finalSlug,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${finalSlug}`,
      },
    });
  } catch (error) {
    console.error('Error creating blog via API:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
