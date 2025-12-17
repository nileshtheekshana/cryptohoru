# Telegram Bot Setup

## Overview
The Telegram bot automatically sends notifications to your channel and group:
- **New Content** → Channel (@cryptohoru)
- **Reminders** → Group (@cryptohoruchat)

## Environment Variables

Add these to your `.env.local` (already configured):

```env
TELEGRAM_BOT=8500077979:AAFcDuaasv-ve2T9UUXHtFmwWALUEQT8orI
TELEGRAM_CHANNEL=@cryptohoru
TELEGRAM_GROUP=@cryptohoruchat
CRON_SECRET=your-secret-key-here  # Optional: for securing cron endpoint
```

## Features

### 1. New Content Notifications (Automatic)
When you create new content in the admin panel, it automatically posts to the **channel**:
- ✅ New Airdrop
- ✅ New Giveaway
- ✅ New AMA

### 2. Reminder Notifications (Cron Job)
The bot sends reminders to the **group** for:
- 🔔 Giveaway ending in 24 hours
- 🔔 Giveaway ending in 1 hour
- 🔔 AMA going live now

## Setting Up Reminders

Reminders require a cron job to call `/api/cron/reminders` every 10-15 minutes.

### Option 1: Cron-Job.org (Free & Easy)

1. Go to [cron-job.org](https://cron-job.org)
2. Create a free account
3. Add new cron job:
   - **Title**: CryptoHoru Telegram Reminders
   - **URL**: `https://cryptohoru.com/api/cron/reminders`
   - **Schedule**: Every 10 minutes
   - **HTTP Method**: GET
   - **Request Headers** (if CRON_SECRET set):
     ```
     Authorization: Bearer your-secret-key-here
     ```

### Option 2: VPS Crontab

If running on your own VPS, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 10 minutes)
*/10 * * * * curl -H "Authorization: Bearer your-secret-key-here" https://cryptohoru.com/api/cron/reminders
```

### Option 3: EasyCron (Alternative)

1. Go to [easycron.com](https://easycron.com)
2. Create free account
3. Add cron job with URL: `https://cryptohoru.com/api/cron/reminders`
4. Set to run every 10 minutes

### Option 4: Uptime Monitors (Hack)

Services like UptimeRobot can ping your endpoint every 5 minutes for free:
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor
3. Type: HTTP(S)
4. URL: `https://cryptohoru.com/api/cron/reminders`
5. Interval: 5 minutes (free tier)

## How It Works

### New Content Flow
```
User creates content → API saves to DB → Telegram notification sent to channel
```

### Reminder Flow
```
Cron job runs every 10 min → Checks DB for:
  - Giveaways ending in 24h (±15min window)
  - Giveaways ending in 1h (±10min window)
  - AMAs starting now (±10min window)
→ Sends reminders to group → Marks as sent in DB
```

## Notification Formats

### New Airdrop
```
🎁 NEW AIRDROP ALERT 🎁

🚀 Title Here
💰 Reward info
⛓️ Blockchain

👉 Participate: [Link]
```

### New Giveaway
```
🎉 NEW GIVEAWAY ALERT 🎉

🎁 Title Here
🏆 Prize info
⏰ Ends: Dec 20, 2025

👉 Enter: [Link]
```

### New AMA
```
💬 NEW AMA ANNOUNCED 💬

🎤 Title Here
🏢 Project Name
📅 Dec 17, 2025, 5:30 PM IST
🎁 Rewards available

👉 Join: [Link]
```

### Giveaway Reminder (1 day/1 hour)
```
⏰ GIVEAWAY ENDING SOON ⏰

🎁 Title Here
🏆 Prize info
⚠️ Ending in 1 hour!

👉 Enter now: [Link]
```

### AMA Live
```
🔴 AMA IS LIVE NOW! 🔴

🎤 Title Here
🏢 Project Name
💬 Join the conversation!

👉 [Link]
```

## Testing

Test new content notifications:
1. Go to admin panel
2. Create a test airdrop/giveaway/AMA
3. Check your Telegram channel for the post

Test reminders manually:
```bash
curl -H "Authorization: Bearer your-secret-key-here" http://localhost:3000/api/cron/reminders
```

## Troubleshooting

### Bot not posting to channel
- Verify bot is admin in @cryptohoru channel
- Check TELEGRAM_CHANNEL is set to `@cryptohoru`
- Check bot token is correct

### Bot not posting to group
- Verify bot is admin in @cryptohoruchat group
- Check TELEGRAM_GROUP is set to `@cryptohoruchat`
- Check bot token is correct

### Reminders not sending
- Verify cron job is running (check cron service logs)
- Test endpoint manually: `curl https://cryptohoru.com/api/cron/reminders`
- Check reminder fields in database (oneDayReminderSent, oneHourReminderSent, liveReminderSent)

### Duplicate reminders
- The system tracks sent reminders in the database
- Each reminder is only sent once
- If you need to resend, manually update the database field to `false`

## Database Fields

Added to schemas for tracking:

**Giveaway:**
- `oneDayReminderSent: Boolean` - Tracks 24h reminder
- `oneHourReminderSent: Boolean` - Tracks 1h reminder

**AMA:**
- `liveReminderSent: Boolean` - Tracks live notification

## Security

The cron endpoint accepts an optional `CRON_SECRET` environment variable. If set, requests must include:

```
Authorization: Bearer your-secret-key-here
```

Without this, anyone can trigger the cron job (not critical, but recommended for production).

## Logs

Check server logs for Telegram activity:
```bash
# VPS
pm2 logs cryptohoru

# Development
npm run dev
```

Look for:
- "Failed to send Telegram notification" - Content creation issues
- "Sent X reminder for..." - Successful reminder sends
- "Cron job error" - Reminder system issues
