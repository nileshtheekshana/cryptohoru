// Telegram Bot API utility for sending notifications

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT || '8500077979:AAFcDuaasv-ve2T9UUXHtFmwWALUEQT8orI';
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL || '@cryptohoru'; // @cryptohoru - for new posts
const TELEGRAM_GROUP = process.env.TELEGRAM_GROUP || '@cryptohoruchat'; // @cryptohoruchat - for reminders

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
}

/**
 * Send a message to Telegram
 */
async function sendTelegramMessage(chatId: string, message: string, parseMode: 'Markdown' | 'HTML' = 'Markdown'): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const payload: TelegramMessage = {
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
      disable_web_page_preview: false,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', data);
      return false;
    }

    console.log('Telegram message sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

/**
 * Send new content announcement to CHANNEL
 */
export async function sendNewContentToChannel(message: string): Promise<boolean> {
  if (!TELEGRAM_CHANNEL) {
    console.error('TELEGRAM_CHANNEL is not set');
    return false;
  }
  return sendTelegramMessage(TELEGRAM_CHANNEL, message);
}

/**
 * Send reminder to GROUP
 */
export async function sendReminderToGroup(message: string): Promise<boolean> {
  if (!TELEGRAM_GROUP) {
    console.error('TELEGRAM_GROUP is not set');
    return false;
  }
  return sendTelegramMessage(TELEGRAM_GROUP, message);
}

/**
 * Generate social post for Airdrop
 */
export function generateAirdropPost(airdrop: any, baseUrl: string): string {
  const postUrl = `${baseUrl}/airdrops/${airdrop.slug || airdrop._id}`;
  
  let post = `🪂 *AIRDROP ALERT* 🪂\n\n`;
  post += `💎 *${airdrop.title}*\n\n`;
  
  if (airdrop.reward) post += `💰 Reward: ${airdrop.reward}\n`;
  if (airdrop.blockchain) post += `⛓️ Blockchain: ${airdrop.blockchain}\n`;
  if (airdrop.endDate) {
    const endDate = toIST(new Date(airdrop.endDate));
    post += `⏰ Ends: ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} IST\n`;
  }
  
  post += `\n🔗 ${postUrl}\n\n`;
  post += `#Airdrop #Crypto #FreeMoney`;
  
  return post;
}

/**
 * Generate social post for Giveaway
 */
export function generateGiveawayPost(giveaway: any, baseUrl: string): string {
  const postUrl = `${baseUrl}/giveaways/${giveaway.slug || giveaway._id}`;
  
  let post = `🎁 *NEW GIVEAWAY* 🎁\n\n`;
  post += `🏆 *${giveaway.title}*\n\n`;
  post += `💰 Prize: *${giveaway.prize}*\n`;
  
  if (giveaway.endDate) {
    const endDate = toIST(new Date(giveaway.endDate));
    post += `⏰ Ends: ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} IST\n`;
  }
  
  post += `\n🎯 Don't miss out!\n`;
  post += `🔗 ${postUrl}\n\n`;
  post += `#Giveaway #Crypto #Win`;
  
  return post;
}

/**
 * Convert UTC date to IST (UTC+5:30)
 */
function toIST(date: Date): Date {
  const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  return istDate;
}

/**
 * Format date to IST string
 */
function formatISTDateTime(date: Date): string {
  const istDate = toIST(date);
  const dateStr = istDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = istDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${dateStr} at ${timeStr} IST`;
}

/**
 * Generate social post for AMA
 */
export function generateAMAPost(ama: any, baseUrl: string): string {
  const postUrl = `${baseUrl}/ama/${ama.slug || ama._id}`;
  
  let post = `🎤 *NEW AMA SESSION* 🎤\n\n`;
  post += `✨ *${ama.title}*\n\n`;
  
  if (ama.project) post += `🏢 Project: *${ama.project}*\n`;
  if (ama.host) post += `👤 Host: ${ama.host}\n`;
  if (ama.date) {
    post += `📅 ${formatISTDateTime(new Date(ama.date))}\n`;
  }
  if (ama.platform) post += `📍 Platform: ${ama.platform}\n`;
  
  post += `\n❓ Got questions? Join us!\n`;
  post += `🔗 ${postUrl}\n\n`;
  post += `#AMA #Crypto #AskMeAnything`;
  
  return post;
}

/**
 * Generate reminder for giveaway ending soon
 */
export function generateGiveawayReminder(giveaway: any, timeLeft: string, baseUrl: string): string {
  const postUrl = `${baseUrl}/giveaways/${giveaway.slug || giveaway._id}`;
  
  let post = `⏰ *GIVEAWAY ENDING SOON* ⏰\n\n`;
  post += `🎁 *${giveaway.title}*\n\n`;
  post += `💰 Prize: *${giveaway.prize}*\n`;
  post += `⚠️ Ending in: *${timeLeft}*!\n\n`;
  post += `⚡ Last chance to enter!\n`;
  post += `🔗 ${postUrl}\n\n`;
  post += `#Giveaway #LastChance`;
  
  return post;
}

/**
 * Generate AMA live notification
 */
export function generateAMALiveNotification(ama: any, baseUrl: string): string {
  const postUrl = `${baseUrl}/ama/${ama.slug || ama._id}`;
  
  let post = `🔴 *AMA IS LIVE NOW* 🔴\n\n`;
  post += `🎤 *${ama.title}*\n\n`;
  
  if (ama.project) post += `🏢 ${ama.project}\n`;
  if (ama.host) post += `👤 Host: ${ama.host}\n`;
  if (ama.platform) post += `📍 ${ama.platform}\n`;
  
  post += `\n🔥 Join now!\n`;
  post += `🔗 ${postUrl}\n\n`;
  post += `#AMA #Live #Crypto`;
  
  return post;
}
