import { getConnectionManager, Connection, ConnectionManager, Repository } from 'typeorm';

import User from '@Models/user';
import UserConnection from '@Models/user_connection';
import UserFriend from '@Models/user_friend';
import UserToken from '@Models/user_token';

class DatabaseManager {
  private connection: Connection

  constructor() {
    const connectionManager: ConnectionManager = getConnectionManager();
    this.connection = connectionManager.create({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'daniel',
      database: 'nextchat',
      synchronize: true,
      logging: false,
      entities: [
        User,
        UserConnection,
        UserFriend,
        UserToken,
      ],
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.getConnection().connect();
      console.log('Database connected!');
    } catch (error) {
      await Promise.reject(error);
      return;
    }
  }

  getConnection(): Connection {
    return this.connection;
  }

  getUsers(): Repository<User> {
    return this.getConnection().getRepository(User);
  }

  getUserConnections(): Repository<UserConnection> {
    return this.getConnection().getRepository(UserConnection);
  }

  getUserFriends(): Repository<UserFriend> {
    return this.getConnection().getRepository(UserFriend);
  }

  getUserTokens(): Repository<UserToken> {
    return this.getConnection().getRepository(UserToken);
  }
}

export default DatabaseManager;
