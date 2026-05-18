import TelegramBot from 'node-telegram-bot-api';

let bot: TelegramBot | null = null;

export const initTelegramBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot?.sendMessage(chatId, `Welcome to Spawn! Your chat ID is ${chatId}. Save this ID in your agent config.`);
  });

  console.log("Telegram bot initialized.");
};

export const sendTelegramAlert = async (chatId: string | undefined, message: string) => {
  if (!bot || !chatId) {
    console.log(`[Mock Telegram Alert]: ${message}`);
    return;
  }
  
  try {
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
};
