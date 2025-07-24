import type { proto } from '@whiskeysockets/baileys';
import type { CommandContext } from '../../zawqx-types';

const pingHandler = async (m: proto.IWebMessageInfo, ctx: CommandContext) => {
  // Calculate latency
  const start = Date.now();
  await ctx.reply('🏓 Pong!');
  const latency = Date.now() - start;
  
  // Detailed response
  await ctx.reply([
    `⚡ *Bot Status* ⚡`,
    `• Latency: ${latency}ms`,
    `• Runtime: ${process.uptime().toFixed(2)}s`,
    `• Memory: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`,
    `• Platform: ${process.platform}`,
    `• Node: ${process.version}`
  ].join('\n'));
};

// Command metadata
pingHandler.meta = {
  command: ['ping', 'test'],
  aliases: ['p'],
  description: 'Test bot responsiveness and get system status',
  usage: `${config.prefix}ping`,
  category: 'utility',
  cooldown: 5, // seconds
  ownerOnly: false,
  adminOnly: false,
  nsfw: false,
  disabled: false
};

// Help information
pingHandler.help = [
  `${config.prefix}ping - Test bot connection`,
  `${config.prefix}ping detailed - Get detailed system information`
];

export default pingHandler;
