import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AMA } from '@/models';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const now = new Date();
    const allAMAs = await AMA.find({}).lean();
    
    const results = allAMAs.map(ama => {
      try {
        const amaDateTime = new Date(ama.date);
        
        // Check if date is valid
        if (isNaN(amaDateTime.getTime())) {
          return {
            title: ama.title,
            date: ama.date,
            error: 'Invalid date',
            currentStatus: ama.status
          };
        }
        
        const nowTime = now.getTime();
        const amaStartTime = amaDateTime.getTime();
        const amaEndTime = amaStartTime + (2 * 60 * 60 * 1000);
        
        let calculatedStatus = 'unknown';
        if (nowTime >= amaStartTime && nowTime <= amaEndTime) {
          calculatedStatus = 'live';
        } else if (nowTime < amaStartTime) {
          calculatedStatus = 'upcoming';
        } else {
          calculatedStatus = 'completed';
        }
        
        return {
          title: ama.title,
          date: ama.date,
          dateISO: amaDateTime.toISOString(),
          currentStatus: ama.status,
          calculatedStatus,
          nowTime,
          amaStartTime,
          amaEndTime,
          isNowBeforeStart: nowTime < amaStartTime,
          isNowAfterEnd: nowTime > amaEndTime,
          isInWindow: nowTime >= amaStartTime && nowTime <= amaEndTime
        };
      } catch (err: any) {
        return {
          title: ama.title,
          date: ama.date,
          error: err.message,
          currentStatus: ama.status
        };
      }
    });
    
    return NextResponse.json({ 
      success: true,
      serverTime: now.toISOString(),
      serverTimestamp: now.getTime(),
      results
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
