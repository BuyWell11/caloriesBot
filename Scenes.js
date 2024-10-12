import { BaseScene } from 'telegraf/scenes';
import UserController, { User } from './User.js';

class SceneGenerator {
  GenCalScene() {
    const cal = new BaseScene('cal');
    cal.enter(async (ctx) => {
      await ctx.reply('Введи кол-во калорий на день');
    });
    cal.on('text', async (ctx) => {
      const currCal = Number(ctx.message.text);
      if (currCal && currCal > 0) {
        const user = new User(ctx.message.from.id, currCal);
        UserController.save(user);
        await ctx.reply('Сохранил');
        cal.leave();
      }
    });
    return cal;
  }
}

export default SceneGenerator;
