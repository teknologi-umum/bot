import dayjs from 'dayjs';

async function jam(context) {
  await context.reply('Disini sekarang jam: ' + dayjs().toString());
}

export default jam;
