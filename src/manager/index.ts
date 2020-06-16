import DatabaseManager from '@Core/database';
import TextsManager from '@Core/texts';
import UsersManager from '@Core/users';
import ServerManager from '@Core/server';

class NextChat {
  private static database: DatabaseManager;
  private static texts: TextsManager;
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

  static getTexts(): TextsManager {
    if (this.texts == null) {
      this.texts = new TextsManager();
    }

    return this.texts;
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

  static getUnix(): number {
    return ~~(Date.now() / 1000);
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default NextChat;
