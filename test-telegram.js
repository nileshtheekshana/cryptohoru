// Quick test script for Telegram bot
const TELEGRAM_BOT = '8500077979:AAFcDuaasv-ve2T9UUXHtFmwWALUEQT8orI';
const TELEGRAM_CHANNEL = '@cryptohoru';

async function testTelegram() {
  try {
    console.log('Testing Telegram bot...');
    console.log('Bot token:', TELEGRAM_BOT);
    console.log('Channel:', TELEGRAM_CHANNEL);
    
    const message = '🧪 **Test Message**\n\nThis is a test from CryptoHoru bot.';
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ SUCCESS! Message sent to Telegram channel');
      console.log('Response:', data);
    } else {
      console.log('❌ FAILED! Telegram API error:');
      console.log('Error:', data);
      console.log('\nPossible issues:');
      console.log('1. Bot is not admin in the channel');
      console.log('2. Channel name is incorrect');
      console.log('3. Bot token is invalid');
    }
  } catch (error) {
    console.error('❌ Network or code error:', error);
  }
}

testTelegram();
