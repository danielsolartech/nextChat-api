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

    let i = 0;
    const getAvatar = (usernameI: string): string => {
      switch(usernameI) {
        case '.':
        case ':':
        case '-':
        case '_': {
          return getAvatar(username[i++].toLowerCase());
        }

        case 'á': {
          return 'a';
        }

        case 'ć': {
          return 'c';
        }

        case 'é': {
          return 'e';
        }

        case 'í': {
          return 'i';
        }

        case 'ó': {
          return 'o';
        }

        case 'ú': {
          return 'u';
        }

        case 'ñ':
        case 'ń': {
          return 'n';
        }

        case 'ý': {
          return 'y';
        }

        case 'ź': {
          return 'z';
        }

        default: {
          return usernameI;
        }
      }
    }

    user.profileImage = 'https://danielsolartech.com/avatars/' + getAvatar(username[i].toLowerCase()) + '.png';
    user.profileBanner = 'https://danielsolartech.com/banners/default.jpg';

    return await this.save(user);
  }

  async save(user: User): Promise<User> {
    return await NextChat.getDatabase().getUsers().save(user);
  }

}

export default UsersManager;