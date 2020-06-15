import NextChat from '@NextChat';
import User from '@Models/user';

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

  async create(user: User): Promise<User> {
    return await NextChat.getDatabase().getUsers().save(user);
  }

}

export default UsersManager;