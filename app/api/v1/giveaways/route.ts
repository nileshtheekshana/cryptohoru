import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/lib/apiAuth';
import clientPromise from '@/lib/mongodb-client';
import { sendNewContentToChannel, generateGiveawayPost } from '@/lib/telegram';
import { ObjectId } from 'mongodb';
import { processBase64Image } from '@/lib/imageProcessor';

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const validation = await validateAPIKey(request, 'create:giveaway');
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
      cost,
      prize,
      winners,
      endDate,
      status,
      requirements,
      tasks,
      link,
      tags,
      slug,
    } = body;

    // Validate required fields
    if (!title || !description || !prize || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, prize, endDate' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('cryptohoru');

    // Generate slug if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if slug exists
    const existing = await db.collection('giveaways').findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json(
        { error: 'A giveaway with this slug already exists' },
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

    const newGiveaway = {
      title,
      description,
      image: finalImage || '',
      cost: cost || 'Free',
      prize,
      winners: winners || 1,
      endDate: new Date(endDate),
      status: status || 'active',
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      tasks: processedTasks,
      link: link || '',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      slug: finalSlug,
      oneDayReminderSent: false,
      oneHourReminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('giveaways').insertOne(newGiveaway);

    // Send Telegram notification
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const message = generateGiveawayPost({ ...newGiveaway, _id: result.insertedId }, baseUrl);
      await sendNewContentToChannel(message);
    } catch (telegramError) {
      console.error('Failed to send Telegram notification:', telegramError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        slug: finalSlug,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/giveaways/${finalSlug}`,
      },
    });
  } catch (error) {
    console.error('Error creating giveaway via API:', error);
    return NextResponse.json(
      { error: 'Failed to create giveaway' },
      { status: 500 }
    );
  }
}
