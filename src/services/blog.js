import { request } from 'undici';

function shuffle(array) {
  var currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

async function getTheDevRead(queh){
  if(queh == "") return "cara pakainya tulis: /devread <apa yang mau kamu cari>,\n Contoh: \n /devread ngehek ig pacar"
  let stack;
  let data = [];

  let placehordel = (title,desc,link) => 
      `Judul: ` + title?.substring(0,64) + `\n\n` + desc?.substring(0,64) + '\n\n' + link;

  let requestDataByMedia = async function(jenis){
    const apis = "https://api.pulo.dev/v1/contents?page=1&media="+jenis+"&query=";
    const { body } = await request(`${apis}` + jenis);
    return shuffle((await body.json()).data).slice(0,2)
  }

  data = data.concat(await requestDataByMedia("tulisan"))
  data = data.concat(await requestDataByMedia("web"))

  if(data.length != 0){
    stack = data.map(x => placehordel(x.title,x.body,x.url)).join("\t --- \n\n")
  }else {
    stack = "Yha ga ketemu, cari keyword lain yuk"
  }

  return stack;
};

/**
 * Send help to user when needed.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
 async function devRead(context) {
    const {
      message: { text },
    } = context;

    let queh;

    if (text.startsWith('/devread ')) {
      queh = text.substring(9);
    } else if (text.startsWith(`/devread@${context.me} `)) {
      queh = text.substring(10 + context.me.length);
    }

    await context.reply(
        await getTheDevRead(queh),
      {
        reply_to_message_id: context.message.chat.id,
      },
    );
  }
  
  /**
   * Send help to user when needed.
   * @param {import('telegraf').Telegraf} bot
   * @returns {Promise<void>}
   */
  export function register(bot) {
    bot.command('devread', devRead);
  
    return [
      {
        command: 'devread',
        description: 'Bacaan untuk Developer.',
      },
    ];
  }
  