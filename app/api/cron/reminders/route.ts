import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Giveaway, AMA } from '@/models';
import { sendReminderToGroup, generateGiveawayReminder, generateAMALiveNotification } from '@/lib/telegram';

export const runtime = 'nodejs';

// This endpoint should be called by a cron job every 10-15 minutes
// For security, verify the request is from a trusted source (optional: check API key)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Optional: Verify cron secret for security
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const now = new Date();
    const baseUrl = process.env.NEXTAUTH_URL || 'https://cryptohoru.com';
    const notifications: string[] = [];

    // Check for giveaways ending in 24 hours (±15 minutes window)
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneDayWindow = 15 * 60 * 1000; // 15 minute window
    
    const giveawaysEndingInOneDay = await Giveaway.find({
      status: { $in: ['active', 'live'] },
      endDate: {
        $gte: new Date(oneDayFromNow.getTime() - oneDayWindow),
        $lte: new Date(oneDayFromNow.getTime() + oneDayWindow)
      },
      // Add a field to track if we've sent this reminder
      oneDayReminderSent: { $ne: true }
    }).limit(10);

    for (const giveaway of giveawaysEndingInOneDay) {
      try {
        const message = generateGiveawayReminder(giveaway.toObject(), '1 day', baseUrl);
        await sendReminderToGroup(message);
        
        // Mark reminder as sent
        giveaway.oneDayReminderSent = true;
        await giveaway.save();
        
        notifications.push(`Sent 1 day reminder for giveaway: ${giveaway.title}`);
      } catch (error) {
        console.error(`Failed to send 1 day reminder for giveaway ${giveaway._id}:`, error);
      }
    }

    // Check for giveaways ending in 1 hour (±10 minutes window)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourWindow = 10 * 60 * 1000; // 10 minute window
    
    const giveawaysEndingInOneHour = await Giveaway.find({
      status: { $in: ['active', 'live'] },
      endDate: {
        $gte: new Date(oneHourFromNow.getTime() - oneHourWindow),
        $lte: new Date(oneHourFromNow.getTime() + oneHourWindow)
      },
      oneHourReminderSent: { $ne: true }
    }).limit(10);

    for (const giveaway of giveawaysEndingInOneHour) {
      try {
        const message = generateGiveawayReminder(giveaway.toObject(), '1 hour', baseUrl);
        await sendReminderToGroup(message);
        
        // Mark reminder as sent
        giveaway.oneHourReminderSent = true;
        await giveaway.save();
        
        notifications.push(`Sent 1 hour reminder for giveaway: ${giveaway.title}`);
      } catch (error) {
        console.error(`Failed to send 1 hour reminder for giveaway ${giveaway._id}:`, error);
      }
    }

    // Check for AMAs going live now (within ±10 minutes of scheduled time)
    const amaWindow = 10 * 60 * 1000; // 10 minute window
    
    const amasGoingLive = await AMA.find({
      status: { $ne: 'hidden' },
      scheduledDate: {
        $gte: new Date(now.getTime() - amaWindow),
        $lte: new Date(now.getTime() + amaWindow)
      },
      liveReminderSent: { $ne: true }
    }).limit(10);

    for (const ama of amasGoingLive) {
      try {
        const message = generateAMALiveNotification(ama.toObject(), baseUrl);
        await sendReminderToGroup(message);
        
        // Mark reminder as sent
        ama.liveReminderSent = true;
        await ama.save();
        
        notifications.push(`Sent live notification for AMA: ${ama.title}`);
      } catch (error) {
        console.error(`Failed to send live notification for AMA ${ama._id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}
