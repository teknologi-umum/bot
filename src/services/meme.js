/**
 * Send meme.
 * @param {String} input
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function meme(input, context) {
  switch (input) {
    case 'kktbsys':
      await context.telegram.sendPhoto(context.message.chat.id, 'https://i.ibb.co/XtSbXBT/image.png');
      break;
    case 'illuminati':
      // Sources: https://giphy.com/search/illuminati
      await context.telegram.sendAnimation(
        context.message.chat.id,
        'https://media.giphy.com/media/uFOW5cbNaoTaU/giphy.gif',
      );
      break;
    case 'yntkts':
      await context.telegram.sendPhoto(context.message.chat.id, 'https://i.ibb.co/P1Q0650/yntkts.jpg');
      break;
    default:
      break;
  }
}

export default meme;
