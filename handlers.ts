import fs from "fs";
import path from "path";
import chalk from "chalk";
import { pathToFileURL } from "url";
import config from "./zawqx/config.js";
import type { BaileysEventMap, proto } from "@whiskeysockets/baileys";

type Plugin = {
  command: string[];
  isBot?: boolean;
  private?: boolean;
  handler: (
    m: proto.IWebMessageInfo,
    ctx: CommandContext
  ) => Promise<void> | void;
};

type CommandContext = {
  prefix: string;
  command: string;
  text: string;
  isBot: boolean;
  pushname: string;
  mime: string;
  quoted: proto.IMessage | null;
  fquoted: proto.IContextInfo | null;
  reply: (msg: string | AnyMessageContent) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  fetchJson: (url: string, options?: RequestInit) => Promise<any>;
  isPrivate: boolean;
  args: string[];
};

let loadedPlugins: Plugin[] = [];

export const loadPlugins = async (directory = "./command") => {
  const dirPath = path.resolve(directory);
  
  if (!fs.existsSync(dirPath)) {
    console.error(chalk.red(`❌ Plugin directory not found: ${dirPath}`));
    return [];
  }

  const files = fs.readdirSync(dirPath);
  loadedPlugins = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const ext = path.extname(filePath);

    if ([".js", ".ts"].includes(ext)) {
      try {
        const fileUrl = pathToFileURL(filePath).href;
        const module = await import(fileUrl + `?update=${Date.now()}`);

        if (module?.default) {
          const plugin = module.default as Plugin;
          if (validatePlugin(plugin, file)) {
            loadedPlugins.push(plugin);
            console.log(chalk.green("✔ Plugin loaded:"), chalk.cyan(file));
          }
        }
      } catch (error) {
        console.error(chalk.red(`❌ Failed to load plugin ${file}:`), error);
      }
    }
  }

  return loadedPlugins;
};

function validatePlugin(plugin: Plugin, filename: string): boolean {
  if (!plugin.command || !Array.isArray(plugin.command)) {
    console.error(chalk.yellow(`⚠ Invalid command in plugin ${filename}`));
    return false;
  }

  if (!plugin.handler || typeof plugin.handler !== "function") {
    console.error(chalk.yellow(`⚠ Missing handler in plugin ${filename}`));
    return false;
  }

  return true;
}

export const watchPlugins = (directory = "./command") => {
  const dirPath = path.resolve(directory);

  if (!fs.existsSync(dirPath)) {
    console.error(chalk.red(`❌ Plugin directory not found: ${dirPath}`));
    return;
  }

  const watcher = fs.watch(dirPath, { recursive: false }, async (eventType, filename) => {
    if (filename && (filename.endsWith(".js") || filename.endsWith(".ts"))) {
      console.log(chalk.yellow(`🔁 Reloading plugin due to changes:`), filename);
      try {
        await loadPlugins(directory);
      } catch (error) {
        console.error(chalk.red(`❌ Failed to reload plugins:`), error);
      }
    }
  });

  process.on("SIGINT", () => {
    watcher.close();
    console.log(chalk.blue("ℹ Plugin watcher stopped"));
  });

  return watcher;
};

export const executeCommand = async (
  text: string,
  m: proto.IWebMessageInfo,
  respond: (msg: string | AnyMessageContent) => Promise<void>
) => {
  const args = text.trim().split(/\s+/);
  const command = args[0].toLowerCase();
  const prefix = config.prefix || "!";
  const isBot = m.key.fromMe || false;
  const pushname = m.pushName || "User";
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
  const mime = Object.keys(m.message || {})[0];
  const fquoted = m.message?.extendedTextMessage?.contextInfo || null;

  const ctx: CommandContext = {
    prefix,
    command: command.replace(prefix, ""),
    text: args.slice(1).join(" "),
    isBot,
    pushname,
    mime,
    quoted,
    fquoted,
    reply: respond,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    fetchJson: async (url, options) => {
      const res = await fetch(url, options);
      return res.json();
    },
    isPrivate: m.key.remoteJid?.endsWith("@s.whatsapp.net") || false,
    args: args.slice(1),
  };

  if (!command.startsWith(prefix)) return;

  for (const plugin of loadedPlugins) {
    if (!plugin.command.includes(ctx.command)) continue;

    if (plugin.isBot && !isBot) return;
    if (plugin.private && !ctx.isPrivate) {
      await respond(config.message?.private || "This command is only available in private chat.");
      return;
    }

    try {
      console.log(chalk.blue(`⚡ Executing command: ${ctx.command}`));
      await plugin.handler(m, ctx);
    } catch (err) {
      console.error(chalk.red(`❌ Error executing plugin ${ctx.command}:`), err);
      await respond("An error occurred while executing the command.");
    }
  }
};
