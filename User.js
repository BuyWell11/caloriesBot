import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true },
  caloriesPerDay: { type: Number, required: true },
  calories: { type: Number, required: true },
});

const UserModel = mongoose.model('user', UserSchema);

export class User {
  constructor(telegramId, caloriesPerDay) {
    this.telegramId = telegramId;
    this.caloriesPerDay = caloriesPerDay;
    this.calories = caloriesPerDay;
  }
}

class UserController {
  static async save(user) {
    return UserModel.create(user).then(console.log(`create ${user.telegramId}`));
  }

  static async update(user) {
    return UserModel.updateOne(user).then(console.log(`update ${user.telegramId}`));
  }

  static async findAll() {
    return await UserModel.find();
  }

  static async findByTelegramId(telegramId) {
    return await UserModel.findOne({ telegramId: telegramId });
  }

  static async resetAllCal() {
    const users = await UserModel.find();
    users.forEach(async (user) => {
      await UserModel.updateOne(user, { calories: user.caloriesPerDay });
    });
  }
}

export default UserController;
