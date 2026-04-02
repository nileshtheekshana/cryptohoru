import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/lib/apiAuth';
import clientPromise from '@/lib/mongodb-client';
import { sendNewContentToChannel, generateAirdropPost } from '@/lib/telegram';
import { ObjectId } from 'mongodb';
import { processBase64Image } from '@/lib/imageProcessor';

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const validation = await validateAPIKey(request, 'create:airdrop');
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
      category,
      cost,
      reward,
      blockchain,
      status,
      startDate,
      endDate,
      requirements,
      tasks,
      tags,
      website,
      twitter,
      telegram,
      discord,
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
    const existing = await db.collection('airdrops').findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json(
        { error: 'An airdrop with this slug already exists' },
        { status: 409 }
      );
    }

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

    const finalImage = await processBase64Image(image);

    const newAirdrop = {
      title,
      description,
      image: finalImage || '',
      category: category || 'Airdrop',
      cost: cost || 'Free',
      reward: reward || '',
      blockchain: blockchain || '',
      status: status || 'active',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      tasks: processedTasks,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      website: website || '',
      twitter: twitter || '',
      telegram: telegram || '',
      discord: discord || '',
      slug: finalSlug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('airdrops').insertOne(newAirdrop);

    // Send Telegram notification
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const message = generateAirdropPost({ ...newAirdrop, _id: result.insertedId }, baseUrl);
      await sendNewContentToChannel(message);
    } catch (telegramError) {
      console.error('Failed to send Telegram notification:', telegramError);
      // Don't fail the request if Telegram fails
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        slug: finalSlug,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/airdrops/${finalSlug}`,
      },
    });
  } catch (error) {
    console.error('Error creating airdrop via API:', error);
    return NextResponse.json(
      { error: 'Failed to create airdrop' },
      { status: 500 }
    );
  }
}
