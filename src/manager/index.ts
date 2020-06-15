import DatabaseManager from '@Core/database';
import UsersManager from '@Core/users';
import ServerManager from '@Core/server';

class NextChat {
  private static database: DatabaseManager;
  private static users: UsersManager;
  private static server: ServerManager;

  static async initialize(): Promise<void> {
    try {
      await this.getDatabase().initialize();
      await this.getServer().initialize();

      this.getServer().listen();
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

  static getServer(): ServerManager {
    if (this.server == null) {
      this.server = new ServerManager();
    }

    return this.server;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default NextChat;
