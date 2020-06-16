import NextChat from '@NextChat';
import User from '@Models/user';
import { Gender } from './enums';

class UsersManager {

  async getById(id: number): Promise<User> {
    return await NextChat.getDatabase().getUsers().findOne({
      id,
    });
  }

  async getByUsername(username: string): Promise<User> {
    return await NextChat.getDatabase().getUsers().findOne({
      username,
    });
  }

  async getByEmail(email: string): Promise<User> {
    return await NextChat.getDatabase().getUsers().findOne({
      email,
    });
  }

  async create(username: string, email: string, password: string, gender: Gender): Promise<User> {
    const user: User = new User();

    user.username = username;
    user.email = email;
    user.encryptPassword(password);
    user.gender = gender;

    return await this.save(user);
  }

  async save(user: User): Promise<User> {
    return await NextChat.getDatabase().getUsers().save(user);
  }

}

export default UsersManager;