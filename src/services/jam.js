import dayjs from 'dayjs';

async function jam(context) {
  try {
    await context.reply('Disini sekarang jam: ' + dayjs().toString());
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

export default jam;
