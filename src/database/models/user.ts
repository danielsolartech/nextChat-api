import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { generateKeys, encryptMessage, generateCode } from '@Core/utils';
import UserConnection from './user_connection';
import NextChat from '@NextChat';
import UserToken, { TokenType } from './user_token';
import * as Moment from 'moment';
import PacketComposer from '@Communication/outgoing/index';
import Connection from '@Communication/connection';
import UserNotification, { NotificationType, NotificationMessage } from './user_notification';
import NotificationCountComposer from '@Communication/outgoing/users/notificationCountComposer';
import NewNotificationComposer from '@Communication/outgoing/users/newNotificationComposer';
import UserFriend, { FriendType } from './user_friend';
import UserAction, { ActionType } from './user_action';

export enum Gender {
  FEMALE = 'F',
  MALE = 'M',
  UNKNOWN = 'U',
}

export interface ILinks {
  name: string;
  link: string;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  gender: Gender;
  biography: string;
  verified: boolean;
  verified_sended: boolean;
  account_created: number;
  online: boolean;
  last_online: number;
  online_time: number;
  profile_image: string;
  profile_banner: string;
  links: ILinks[];
  followers: number;
  following: number;
  friends: number;
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
    type: 'varchar',
    length: 250,
    charset: 'utf8m4',
    collation: 'utf8mb4_unicode_ci',
  })
  biography: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  verified: boolean;

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

  @Column({
    type: 'json',
  })
  links: ILinks[];

  async getActions(type: ActionType): Promise<UserAction[]> {
    return await NextChat.getDatabase().getUserActions()
      .createQueryBuilder('action')
      .leftJoinAndSelect('action.user', 'User')
      .orderBy('action.addedTime', 'DESC')
      .where('action.type = :type', { type })
      .getMany();
  }

  async getAction(type: ActionType): Promise<UserAction> {
    return (await this.getActions(type))[0] || null;
  }

  async addAction(type: ActionType, ip: string): Promise<UserAction> {
    const action: UserAction = new UserAction();

    action.type = type;
    action.user = this;
    action.ip = ip;

    return await NextChat.getDatabase().getUserActions().save(action);
  }

  async addConnection(ip: string): Promise<UserConnection> {
    const connection: UserConnection = new UserConnection();

    connection.user = this;
    connection.ip = ip;

    return await NextChat.getDatabase().getUserConnections().save(connection);
  }

  async getFollowers(): Promise<UserFriend[]> {
    const users: any[] = await NextChat.getDatabase().getUserFriends()
      .createQueryBuilder('uf')
      .select('uf.userOne', 'user_id')
      .addSelect('uf.timestamp', 'timestamp')
      .addSelect('uf.id', 'id')
      .where('uf.userTwo = :user AND type = :type', {
        user: this.id,
        type: FriendType.FOLLOW,
      })
      .getRawMany();

    const data: UserFriend[] = [];
    if (users.length) {
      for await (let user of users) {
        const u: User = await NextChat.getUsers().getById(user.user_id);

        if (u) {
          data.push({
            id: user.id,
            userOne: u,
            userTwo: this,
            timestamp: user.timestamp,
            type: FriendType.FOLLOW,
          });
        }
      }
    }

    return data;
  }

  async isFollower(user: User): Promise<UserFriend> {
    const followers: UserFriend[] = await this.getFollowers();
    let follower: UserFriend = null;

    if (followers.length) {
      for (let f of followers) {
        if (f.userOne.id === user.id) {
          follower = f;
          break;
        }
      }
    }

    return follower;
  }

  async getFollowing(): Promise<UserFriend[]> {
    const users: any[] = await NextChat.getDatabase().getUserFriends()
      .createQueryBuilder('uf')
      .select('uf.userTwo', 'user_id')
      .addSelect('uf.timestamp', 'timestamp')
      .addSelect('uf.id', 'id')
      .where('uf.userOne = :user AND type = :type', {
        user: this.id,
        type: FriendType.FOLLOW,
      })
      .getRawMany();

    const data: UserFriend[] = [];
    if (users.length) {
      for await (let user of users) {
        const u: User = await NextChat.getUsers().getById(user.user_id);

        if (u) {
          data.push({
            id: user.id,
            userOne: this,
            userTwo: u,
            timestamp: user.timestamp,
            type: FriendType.FOLLOW,
          });
        }
      }
    }

    return data;
  }

  async isFollowing(user: User): Promise<UserFriend> {
    const followings: UserFriend[] = await this.getFollowing();
    let following: UserFriend = null;

    if (followings.length) {
      for (let f of followings) {
        if (f.userTwo.id === user.id) {
          following = f;
          break;
        }
      }
    }

    return following;
  }

  async getFriends(): Promise<UserFriend[]> {
    try {
      const users: any[] = await NextChat.getDatabase().getUserFriends()
        .createQueryBuilder('uf')
        .select('uf.id', 'id')
        .addSelect('uf.userOne', 'user_one')
        .addSelect('uf.userTwo', 'user_two')
        .addSelect('uf.timestamp', 'timestamp')
        .where('uf.userOne = :user AND type = :type OR uf.userTwo = :user AND type = :type', {
          user: this.id,
          type: FriendType.FRIEND,
        })
        .getRawMany();

      const data: UserFriend[] = [];
      if (users.length) {
        for await (let user of users) {
          const u: User = await NextChat.getUsers().getById(user.user_one == this.id ? user.user_two : user.user_one);

          if (u) {
            data.push({
              id: user.id,
              userOne: user.user_one == this.id ? this : u,
              userTwo: user.user_two == this.id ? this : u,
              timestamp: user.timestamp,
              type: FriendType.FRIEND,
            });
          }
        }
      }

      return data;
    } catch (error) {
      await Promise.reject(error);
      return [];
    }
  }

  async isFriend(user: User): Promise<UserFriend> {
    const userFriend: UserFriend[] = await this.getFriends();
    let friend: UserFriend = null;

    if (userFriend.length) {
      for (let u of userFriend) {
        if (u.userOne.id === user.id || u.userTwo.id === user.id) {
          friend = u;
          break;
        }
      }
    }

    return friend;
  }

  async getFriendRequests(): Promise<UserFriend[]> {
    try {
      const users: any[] = await NextChat.getDatabase().getUserFriends()
        .createQueryBuilder('uf')
        .select('uf.id', 'id')
        .addSelect('uf.userOne', 'user_one')
        .addSelect('uf.userTwo', 'user_two')
        .addSelect('uf.timestamp', 'timestamp')
        .where('uf.userOne = :user AND type = :type OR uf.userTwo = :user AND type = :type', {
          user: this.id,
          type: FriendType.FRIEND_REQUEST,
        })
        .getRawMany();

      const data: UserFriend[] = [];
      if (users.length) {
        for await (let user of users) {
          const u: User = await NextChat.getUsers().getById(user.user_one == this.id ? user.user_two : user.user_one);

          if (u) {
            data.push({
              id: user.id,
              userOne: user.user_one == this.id ? this : u,
              userTwo: user.user_two == this.id ? this : u,
              timestamp: user.timestamp,
              type: FriendType.FRIEND_REQUEST,
            });
          }
        }
      }

      return data;
    } catch (error) {
      await Promise.reject(error);
      return [];
    }
  }

  async isFriendRequest(user: User): Promise<UserFriend> {
    const userFriend: UserFriend[] = await this.getFriendRequests();
    let friend: UserFriend = null;

    if (userFriend.length) {
      for (let u of userFriend) {
        if (u.userOne.id === user.id || u.userTwo.id === user.id) {
          friend = u;
          break;
        }
      }
    }

    return friend;
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

  async removeNotification(type: NotificationType, message: NotificationMessage): Promise<void> {
    const notifications: any[] = await NextChat.getDatabase().getUserNotifications()
      .createQueryBuilder('un')
      .select('un.id', 'id')
      .addSelect('un.readed', 'readed')
      .addSelect('un.message', 'message')
      .where('un.type = :type && un.user = :user', {
        type,
        user: this.id,
      })
      .getRawMany();

    if (notifications.length) {
      for await (let notification of notifications) {
        if (notification.message == JSON.stringify(message)) {
          await NextChat.getDatabase().getUserNotifications().delete({ id: notification.id });

          if (!notification.readed) {
            await this.sendNotificationCount();
          }

          break;
        }
      }
    }
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
    let verified_sended: boolean = false;
    if (await this.getToken(TokenType.VERIFY_ACCOUNT)) {
      verified_sended = true;
    }

    return {
      id: this.id,
      username: this.username,
      email: this.email,
      gender: this.gender,
      biography: this.biography,
      verified: this.verified,
      verified_sended,
      account_created: Moment(this.accountCreated).unix(),
      online: this.online,
      last_online: Moment(this.lastOnline).unix(),
      online_time: this.onlineTime,
      profile_image: this.profileImage,
      profile_banner: this.profileBanner,
      links: this.links,
      followers: (await this.getFollowers()).length,
      following: (await this.getFollowing()).length,
      friends: (await this.getFriends()).length,
    };
  }
}

export default User;
