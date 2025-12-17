import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb-client';
import { generateAPIKey } from '@/lib/apiAuth';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('cryptohoru');
    
    const apiKeys = await db
      .collection('apikeys')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ data: apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, permissions, rateLimit, expiresInDays } = body;

    if (!name || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one permission are required' },
        { status: 400 }
      );
    }

    const validPermissions = [
      'create:airdrop',
      'create:ama',
      'create:giveaway',
      'create:blog',
      'create:news',
      'create:p2e',
    ];

    const invalidPerms = permissions.filter(
      (p: string) => !validPermissions.includes(p)
    );
    if (invalidPerms.length > 0) {
      return NextResponse.json(
        { error: `Invalid permissions: ${invalidPerms.join(', ')}` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('cryptohoru');

    const apiKey = generateAPIKey();
    
    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const newKey = {
      name,
      key: apiKey,
      description: description || '',
      permissions,
      status: 'active',
      rateLimit: rateLimit || 100,
      usageCount: 0,
      lastUsed: null,
      expiresAt,
      createdBy: session.user.email,
      createdAt: new Date(),
      revokedAt: null,
    };

    await db.collection('apikeys').insertOne(newKey);

    return NextResponse.json({ 
      success: true,
      data: newKey 
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
