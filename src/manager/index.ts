import DatabaseManager from '@Core/database';
import UsersManager from '@Core/users';

class NextChat {
  private static database: DatabaseManager;
  private static users: UsersManager;

  static async initialize(): Promise<void> {
    try {
      await this.getDatabase().initialize();
    } catch (error) {
      console.log(error);
    }
  }

  static getDatabase(): DatabaseManager {
    if (this.database == null) {
      this.database = new DatabaseManager();
    }

    return this.database;
  }

  static getUsers(): UsersManager {
    if (this.users == null) {
      this.users = new UsersManager();
    }

    return this.users;
  }
}

export default NextChat;
