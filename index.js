import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { session, Telegraf } from 'telegraf';
import SceneGenerator from './Scenes.js';
import { Stage } from 'telegraf/scenes';
import { message } from 'telegraf/filters';
import UserController, { User } from './User.js';
import cron from 'node-cron';

dotenv.config();

const uri = process.env.MONGODB_URI;
console.log(uri);
await mongoose
  .connect(uri)
  .then(() => console.log('Соединение с MongoDB успешно'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

const tgToken = process.env.TG_TOKEN;

const bot = new Telegraf(tgToken);

const scensGenerator = new SceneGenerator();

const calScene = scensGenerator.GenCalScene();

const stage = new Stage([calScene]);

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  await ctx.scene.enter('cal');
});

async function updateCal(ctx, cal) {
  const user = await UserController.findByTelegramId(ctx.message.from.id);
  user.calories = user.calories - cal;
  UserController.update(user);
  await ctx.reply(`Осталось ${user.calories} калорий на день`);
}

bot.on(message('text'), async (ctx) => {
  const cal = Number(ctx.message.text);
  if (cal && cal > 0) {
    updateCal(ctx, cal);
  } else if (ctx.message.text.includes('*')) {
    const [cal, count] = ctx.message.text.split('*').map((s) => Number(s.trim()));
    if (cal && cal > 0 && count && count > 0) {
      updateCal(ctx, cal * count);
    }
  } else {
    const user = await UserController.findByTelegramId(ctx.message.from.id);
    ctx.sendMessage(user);
  }
});

bot.command('me', async (ctx) => {
  const user = await UserController.findByTelegramId(ctx.message.from.id);
  ctx.sendMessage(user);
});

cron.schedule(
  '0 0 * * *',
  () => {
    UserController.resetAllCal();
    console.log(`Сбросил калории на день`);
  },
  {
    scheduled: true,
    timezone: 'Europe/Moscow',
  }
);

bot.launch(() => console.log('Tg bot started'));
