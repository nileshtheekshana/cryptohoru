import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/lib/apiAuth';
import clientPromise from '@/lib/mongodb-client';
import { sendNewContentToChannel, generateAMAPost } from '@/lib/telegram';
import { ObjectId } from 'mongodb';
import { processBase64Image } from '@/lib/imageProcessor';

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const validation = await validateAPIKey(request, 'create:ama');
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
      project,
      host,
      cost,
      date,
      platform,
      link,
      rewards,
      preAMA,
      preAMADetails,
      status,
      tags,
      slug,
      tasks,
    } = body;

    // Validate required fields
    if (!title || !description || !project || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, project, date' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('cryptohoru');

    // Generate slug if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if slug exists
    const existing = await db.collection('amas').findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json(
        { error: 'An AMA with this slug already exists' },
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

    const newAMA = {
      title,
      description,
      image: finalImage || '',
      project,
      host: host || '',
      cost: cost || 'Free',
      date: new Date(date),
      platform: platform || '',
      link: link || '',
      rewards: rewards || '',
      preAMA: preAMA || false,
      preAMADetails: preAMADetails || '',
      status: status || 'upcoming',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      tasks: processedTasks,
      slug: finalSlug,
      liveReminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('amas').insertOne(newAMA);

    // Send Telegram notification
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const message = generateAMAPost({ ...newAMA, _id: result.insertedId }, baseUrl);
      await sendNewContentToChannel(message);
    } catch (telegramError) {
      console.error('Failed to send Telegram notification:', telegramError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        slug: finalSlug,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ama/${finalSlug}`,
      },
    });
  } catch (error) {
    console.error('Error creating AMA via API:', error);
    return NextResponse.json(
      { error: 'Failed to create AMA' },
      { status: 500 }
    );
  }
}
