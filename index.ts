import { 
  makeWASocket, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  DisconnectReason, 
  Browsers,
  MessageUpsertType,
  ConnectionState,
  WAMessage,
  AnyMessageContent
} from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import { loadPlugins, executeCommand } from './handlers'
import { color } from './zawqx/colors'

const logger = pino({ level: 'silent' })

async function startZawqx() {
  const { state, saveCreds } = await useMultiFileAuthState('./zawqx/sesibot')
  const { version, isLatest } = await fetchLatestBaileysVersion()

  if (!isLatest) {
    logger.warn(`Using BAILAYS version ${version}, newer version available`)
  }

  const zawqx = makeWASocket({
    logger,
    printQRInTerminal: true,
    auth: state,
    version,
    browser: Browsers.macOS('Desktop'),
    msgRetryCounterMap: {},
    retryRequestDelayMs: 250,
    markOnlineOnConnect: false,
    emitOwnEvents: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      // Implement message fetching logic if needed
      return undefined
    },
    patchMessageBeforeSending: (msg) => {
      if (msg?.contextInfo?.mentionedJid) {
        delete msg.contextInfo.mentionedJid
      }
      return msg
    }
  })

  await loadPlugins()

  zawqx.ev.on('creds.update', saveCreds)

  zawqx.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update

    if (qr) {
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode 
        !== DisconnectReason.loggedOut

      if (shouldReconnect) {
        setTimeout(startZawqx, 5000) // Add delay before reconnecting
      }
    }

    if (connection === 'open') {
      console.log(color('Bot successfully connected!', 'green'))
      try {
        await zawqx.updateProfileStatus('Active - zawqx')
        await zawqx.newsletterFollow('120363367787013309@newsletter')
      } catch (error) {
        logger.error('Failed to update profile or follow newsletter:', error)
      }
    }
  })

  zawqx.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    const msg = messages[0]
    if (!msg?.message || msg.key.fromMe) return

    const text = getMessageText(msg)
    if (!text) return

    const sender = msg.key.remoteJid || 'unknown'

    try {
      await executeCommand(text, msg, async (response: string | AnyMessageContent) => {
        await zawqx.sendMessage(sender, typeof response === 'string' ? { text: response } : response)
      })
    } catch (error) {
      logger.error('Error processing command:', error)
      await zawqx.sendMessage(sender, { 
        text: 'An error occurred while processing your request.'
      })
    }
  })

  // Add error handling
  zawqx.ev.on('connection.error', (error) => {
    logger.error('Connection error:', error)
  })

  process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...')
    zawqx.end(undefined)
    process.exit(0)
  })
}

function getMessageText(msg: WAMessage): string | undefined {
  const message = msg.message
  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    message?.documentMessage?.caption
  )
}

startZawqx().catch(error => {
  console.error('Failed to start bot:', error)
  process.exit(1)
})
