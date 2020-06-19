import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Gender, TokenType } from '@Core/users/enums';
import { generateKeys, encryptMessage, generateCode } from '@Core/utils';
import UserConnection from './user_connection';
import NextChat from '@NextChat';
import UserToken from './user_token';
import * as Moment from 'moment';
import PacketComposer from '@Communication/outgoing/index';
import Connection from '@Communication/connection';
import UserNotification, { NotificationType, NotificationMessage } from './user_notification';
import NotificationCountComposer from '@Communication/outgoing/users/notificationCountComposer';
import NewNotificationComposer from '@Communication/outgoing/users/newNotificationComposer';
import UserFriend, { FriendType } from './user_friend';

export interface IUser {
  id: number;
  username: string;
  email: string;
  gender: Gender;
  account_created: number;
  online: boolean;
  last_online: number;
  online_time: number;
  profile_image: string;
  profile_banner: string;
  followers: number;
}

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 25,
    nullable: false,
    unique: true,
  })
  username: string;

  @Column({
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: false,
    default: Gender.UNKNOWN,
  })
  gender: Gender;

  @Column()
  password: string;

  @Column({
    name: 'password_key',
  })
  passwordKey: string;

  encryptPassword(password: string): void {
    const keys = generateKeys(~~(password.length * (350 / 37)));

    this.password = encryptMessage(password, keys.public_key);
    this.passwordKey = keys.public_key;
  }

  checkPassword(password: string): boolean {
    return encryptMessage(password, this.passwordKey) === this.password;
  }

  @Column({
    name: 'account_created',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  accountCreated: string;

  @Column({
    nullable: false,
    default: false,
  })
  online: boolean;

  @Column({
    name: 'last_online',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastOnline: string;

  @Column({
    name: 'online_time',
    nullable: false,
    default: 0,
  })
  onlineTime: number;

  @Column({
    name: 'profile_image',
  })
  profileImage: string;

  @Column({
    name: 'profile_banner',
  })
  profileBanner: string;

  async addConnection(ip: string): Promise<UserConnection> {
    const connection: UserConnection = new UserConnection();

    connection.user = this;
    connection.ip = ip;

    return await NextChat.getDatabase().getUserConnections().save(connection);
  }

  async getFollowers(): Promise<UserFriend[]> {
    try {
      return await NextChat.getDatabase().getUserFriends().find({
        userTwo: this,
        type: FriendType.FOLLOW,
      });
    } catch (error) {
      await Promise.reject(error);
      return [];
    }
  }

  async isFriend(user: User): Promise<UserFriend> {
    try {
      let friend: UserFriend = await NextChat.getDatabase().getUserFriends().findOne({
        userOne: this,
        userTwo: user,
      });

      if (!friend) {
        friend = await NextChat.getDatabase().getUserFriends().findOne({
          userOne: user,
          userTwo: this,
        });
      }

      return friend;
    } catch (error) {
      await Promise.reject(error);
      return null;
    }
  }

  async sendNotificationCount(): Promise<boolean> {
    return await this.sendPacket(new NotificationCountComposer(this));
  }

  async sendNotification(type: NotificationType, message: NotificationMessage): Promise<UserNotification> {
    const notification: UserNotification = new UserNotification();

    notification.user = this;
    notification.type = type;
    notification.message = message;

    await NextChat.getDatabase().getUserNotifications().save(notification);

    if (this.online) {
      await this.sendPacket(new NewNotificationComposer(notification));
      await this.sendNotificationCount();
    }

    return notification;
  }

  async getToken(type: TokenType): Promise<UserToken> {
    const token: UserToken = await NextChat.getDatabase().getUserTokens().findOne({
      user: this,
      type,
    }, {
      order: {
        expire: 'DESC',
      },
    });

    if (token && Moment(token.expire).unix() > NextChat.getUnix()) {
      return token;
    }

    return null;
  }

  async getActiveToken(type: TokenType, token: string, ip: string): Promise<UserToken> {
    const userToken: UserToken = await NextChat.getDatabase().getUserTokens().findOne({
      user: this,
      type,
      token,
      ip,
    }, {
      order: {
        expire: 'DESC',
      },
    });

    if (userToken && Moment(userToken.expire).unix() > NextChat.getUnix()) {
      return userToken;
    }

    return null;
  }

  async addToken(type: TokenType, expire: number, ip: string): Promise<UserToken> {
    let lastToken: UserToken = await this.getToken(type);
    if (lastToken) {
      return lastToken;
    }

    const token: UserToken = new UserToken();

    token.user = this;
    token.type = type;
    token.token = 'nextchat-' + generateCode(30) + '-' + generateCode(15);
    token.ip = ip;
    token.expire = new Date(expire).toString();

    return await NextChat.getDatabase().getUserTokens().save(token);
  }

  async sendPacket(packet: PacketComposer): Promise<boolean> {
    try {
      const connection: Connection = NextChat.getServer().getCommunication().getConnection(this.id);
      if (!connection) {
        throw new Error('No connection for user.');
      }

      return await connection.sendPacket(packet);
    } catch (error) {
      return false;
    }
  }

  async toArray(): Promise<IUser> {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      gender: this.gender,
      account_created: Moment(this.accountCreated).unix(),
      online: this.online,
      last_online: Moment(this.lastOnline).unix(),
      online_time: this.onlineTime,
      profile_image: this.profileImage,
      profile_banner: this.profileBanner,
      followers: (await this.getFollowers()).length,
    };
  }
}

export default User;
