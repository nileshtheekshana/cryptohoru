import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/lib/apiAuth';
import clientPromise from '@/lib/mongodb-client';
import { ObjectId } from 'mongodb';
import { processBase64Image } from '@/lib/imageProcessor';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const validation = await validateAPIKey(request, 'update:airdrop');
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();
    const updateData: any = { ...body, updatedAt: new Date() };
    
    // Don't allow updating _id
    delete updateData._id;

    if (updateData.image) {
      const processed = await processBase64Image(updateData.image);
      if (processed) {
        updateData.image = processed;
      }
    }

    // Process tasks if provided
    if (updateData.tasks && Array.isArray(updateData.tasks)) {
      updateData.tasks = updateData.tasks.map((task: any) => ({
        ...task,
        _id: task._id ? new ObjectId(task._id) : new ObjectId(),
      }));
    }

    const client = await clientPromise;
    const db = client.db('cryptohoru');

    const result = await db.collection('airdrops').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Airdrop not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Airdrop updated successfully' });
  } catch (error) {
    console.error('Error updating airdrop via API:', error);
    return NextResponse.json({ error: 'Failed to update airdrop' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const validation = await validateAPIKey(request, 'delete:airdrop');
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('cryptohoru');

    const result = await db.collection('airdrops').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Airdrop not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Airdrop deleted successfully' });
  } catch (error) {
    console.error('Error deleting airdrop via API:', error);
    return NextResponse.json({ error: 'Failed to delete airdrop' }, { status: 500 });
  }
}
