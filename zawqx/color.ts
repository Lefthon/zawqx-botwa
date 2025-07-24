import chalk from "chalk";
import type { ChalkInstance } from "chalk";

type ColorPalette = {
  // Basic colors
  info: ChalkInstance;
  success: ChalkInstance;
  warning: ChalkInstance;
  error: ChalkInstance;
  gray: ChalkInstance;
  cyan: ChalkInstance;
  bold: ChalkInstance;
  
  // New additions
  debug: ChalkInstance;
  highlight: ChalkInstance;
  timestamp: ChalkInstance;
  command: ChalkInstance;
  url: ChalkInstance;
  
  // Utility functions
  rainbow: (text: string) => string;
  gradient: (text: string, colors: ChalkInstance[]) => string;
  prefix: (type: 'info' | 'success' | 'warning' | 'error', text: string) => string;
};

export const color: ColorPalette = {
  // Basic colors
  info: chalk.blueBright,
  success: chalk.greenBright,
  warning: chalk.yellowBright,
  error: chalk.redBright,
  gray: chalk.gray,
  cyan: chalk.cyanBright,
  bold: chalk.bold,
  
  // New colors
  debug: chalk.magentaBright,
  highlight: chalk.bgYellow.black,
  timestamp: chalk.hex('#AAAAAA'),
  command: chalk.hex('#FFA500'),
  url: chalk.underline.blue,
  
  // Rainbow effect
  rainbow: (text: string) => {
    const rainbowColors = [
      chalk.redBright, 
      chalk.yellowBright,
      chalk.greenBright,
      chalk.blueBright,
      chalk.magentaBright
    ];
    return text.split('').map((char, i) => 
      rainbowColors[i % rainbowColors.length](char)
    ).join('');
  },
  
  // Gradient effect
  gradient: (text: string, colors: ChalkInstance[]) => {
    const segmentLength = Math.max(1, Math.floor(text.length / colors.length));
    return text.split('').map((char, i) => {
      const colorIndex = Math.min(
        Math.floor(i / segmentLength), 
        colors.length - 1
      );
      return colors[colorIndex](char);
    }).join('');
  },
  
  // Prefixed messages
  prefix: (type, text) => {
    const prefixes = {
      info: color.info('ℹ'),
      success: color.success('✔'),
      warning: color.warning('⚠'),
      error: color.error('✖')
    };
    return `${prefixes[type]} ${text}`;
  }
};

// Add aliases for common patterns
color.success.prefix = (text: string) => color.prefix('success', text);
color.info.prefix = (text: string) => color.prefix('info', text);
color.warning.prefix = (text: string) => color.prefix('warning', text);
color.error.prefix = (text: string) => color.prefix('error', text);

// Example usage:
// console.log(color.success.prefix('Bot started successfully'));
// console.log(color.rainbow('Fancy rainbow text'));
// console.log(color.gradient('Gradient text', [chalk.red, chalk.yellow, chalk.green]));
