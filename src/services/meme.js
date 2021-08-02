/**
 * Send meme.
 * @param {String} input
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function meme(input, context) {
  try {
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
      default:
        break;
    }
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

export default meme;
