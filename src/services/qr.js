import { QRCodeCanvas } from '@cheprasov/qrcode';

const logoUrl = 'https://raw.githubusercontent.com/papnkukn/qrcode-svg/master/src/qr/elon.jpg';

/**
 * Convert text to QR code.
 * @param {import('telegraf').Telegraf} bot
 */
export function register(bot) {
  bot.command('qr', async (context) => {
    const {
      message: { text, message_id },
    } = context;
    if (text.startsWith('/qr ')) {
      const qrCanvas = new QRCodeCanvas(text.substring(), {
        level: 'Q',
        image: {
          source: logoUrl,
          width: '20%',
          height: '20%',
          x: 'center',
          y: 'center',
        },
      });
      await context.replyWithPhoto(
        {
          source: qrCanvas.toDataUrl(),
        },
        {
          caption: text,
          reply_to_message_id: message_id,
        },
      );
    }
  });
}
