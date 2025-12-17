import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/lib/apiAuth';
import clientPromise from '@/lib/mongodb-client';
import { sendTelegramNotification } from '@/lib/telegram';

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
      name,
      description,
      requirements,
      tags,
      totalPrize,
      endDate,
      chain,
      socialLinks,
      image,
      slug,
    } = body;

    // Validate required fields
    if (!name || !description || !requirements || !totalPrize || !endDate || !chain) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, requirements, totalPrize, endDate, chain' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('cryptohoru');

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if slug exists
    const existing = await db.collection('airdrops').findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json(
        { error: 'An airdrop with this slug already exists' },
        { status: 409 }
      );
    }

    const newAirdrop = {
      name,
      description,
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      totalPrize,
      endDate: new Date(endDate),
      chain,
      socialLinks: socialLinks || {},
      image: image || '/default-airdrop.jpg',
      slug: finalSlug,
      isActive: true,
      createdBy: 'API',
      createdAt: new Date(),
    };

    const result = await db.collection('airdrops').insertOne(newAirdrop);

    // Send Telegram notification
    try {
      await sendTelegramNotification({
        ...newAirdrop,
        _id: result.insertedId,
      }, 'airdrop');
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
