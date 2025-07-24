interface BotConfig {
  ownerNumber: string[];
  ownerName: string;
  botName: string;
  language: 'id' | 'en' | string;
  prefix: string;
  sessionName: string;
  mess: {
    owner: string;
    wait: string;
    error: string;
    done: string;
    admin: string;
    groupOnly: string;
    privateOnly: string;
    botAdmin: string;
  };
  api?: {
    key?: string;
    url?: string;
  };
  database?: {
    uri?: string;
    name?: string;
  };
  debug: boolean;
}

const config: BotConfig = {
  // Ownership
  ownerNumber: ["6282298334109"],
  ownerName: "Lefthon",
  botName: "zawqx",
  
  // Localization
  language: "id",
  
  // Bot settings
  prefix: "!",
  sessionName: "zawqx-session",
  debug: false,

  // Messages
  mess: {
    owner: "Fitur ini hanya untuk owner bot!",
    wait: "⏳ Mohon tunggu sebentar...",
    error: "❌ Terjadi kesalahan!",
    done: "✅ Selesai!",
    admin: "Fitur ini hanya untuk admin grup!",
    groupOnly: "Fitur ini hanya bisa digunakan di grup!",
    privateOnly: "Fitur ini hanya bisa digunakan di private chat!",
    botAdmin: "Jadikan bot sebagai admin untuk menggunakan fitur ini!",
  },

  // API configuration (optional)
  api: {
    key: "",
    url: ""
  },

  // Database configuration (optional)
  database: {
    uri: "",
    name: "zawqx_db"
  }
};

export default config;

/*
 * Bot Configuration Documentation:
 * 
 * ~> Basic Information:
 * - ownerNumber: Array of owner numbers with country code
 * - ownerName: Name of the bot owner
 * - botName: Name of your bot
 * - language: Default language ('id' for Indonesian)
 * 
 * ~> Bot Settings:
 * - prefix: Command prefix (default "!")
 * - sessionName: Session storage identifier
 * - debug: Enable debug mode
 * 
 * ~> Message Templates:
 * - mess: Various response message templates
 * 
 * ~> Optional Configurations:
 * - api: For external API services
 * - database: For database connections
 * 
 * ~> Script base: TypeScript WhatsApp Bot
 * ~> Maintained by: zawqx
 * ~> Channel: https://whatsapp.com/channel/0029VawsCnQ9mrGkOuburC1z
 */
