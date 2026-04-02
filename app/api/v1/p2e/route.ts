import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/lib/apiAuth';
import clientPromise from '@/lib/mongodb-client';
import { ObjectId } from 'mongodb';
import { processBase64Image } from '@/lib/imageProcessor';

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const validation = await validateAPIKey(request, 'create:p2e');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      image,
      imageUrl,
      cost,
      blockchain,
      gameType,
      genre,
      tokenSymbol,
      earnings,
      playToEarnMechanism,
      playLink,
      websiteUrl,
      status,
      website,
      twitter,
      discord,
      whitepaper,
      requirements,
      features,
      tasks,
      tags,
      slug,
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('cryptohoru');

    // Generate slug if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if slug exists
    const existing = await db.collection('p2egames').findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json(
        { error: 'A P2E game with this slug already exists' },
        { status: 409 }
      );
    }

    const finalImage = await processBase64Image(image);
    const finalImageUrl = await processBase64Image(imageUrl);

    // Process tasks: add ObjectId to each task
    const processedTasks = Array.isArray(tasks) 
      ? tasks.map((task: any) => ({
          _id: new ObjectId(),
          title: task.title || '',
          description: task.description || '',
          type: task.type || 'social',
          link: task.link || '',
          reward: task.reward || ''
        }))
      : [];

    const newP2E = {
      title,
      description,
      image: finalImage || '',
      imageUrl: finalImageUrl || '',
      cost: cost || 'Free',
      blockchain: blockchain || '',
      gameType: gameType || '',
      genre: genre || '',
      tokenSymbol: tokenSymbol || '',
      earnings: earnings || '',
      playToEarnMechanism: playToEarnMechanism || '',
      playLink: playLink || '',
      websiteUrl: websiteUrl || '',
      status: status || 'active',
      website: website || '',
      twitter: twitter || '',
      discord: discord || '',
      whitepaper: whitepaper || '',
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      features: Array.isArray(features) ? features : (features ? [features] : []),
      tasks: processedTasks,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      slug: finalSlug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('p2egames').insertOne(newP2E);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        slug: finalSlug,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/p2e-games/${finalSlug}`,
      },
    });
  } catch (error) {
    console.error('Error creating P2E game via API:', error);
    return NextResponse.json(
      { error: 'Failed to create P2E game' },
      { status: 500 }
    );
  }
}
