import { Request, Response } from 'express';
import { generateCode, getIP } from '@Core/utils';
import User, { IUser, Gender } from '@Models/user';
import NextChat from '@NextChat';
import { sendError } from '@Core/server/responses';
import UserToken, { TokenType } from '@Models/user_token';
import { ERequest } from '..';
import { sendVerifyAccountEmail } from '@Core/email/templates';

export const generateCaptcha = (req: Request, res: Response): void => {
  res.status(200).jsonp({
    code: generateCode(6),
  });
};

export const signUp = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (req.user && req.token) {
      throw 'username||You are authenticated.';
    }

    const username: string = req.body.username;
    if (!username || !username.length) {
      throw 'username||You must enter an username.';
    }

    if (username.length < 4 || username.length > 25) {
      throw 'username||The username only contains between 4 and 25 characters.';
    }

    if (!(/^[a-zA-Z0-9.:_-]*$/.test(username))) {
      throw 'username||The username can not contains special characters or spaces.';
    }

    if (await NextChat.getUsers().getByUsername(username)) {
      throw 'username||The username already exists.';
    }

    const email: string = req.body.email;
    if (!email || !email.length) {
      throw 'email||You must enter an e-mail address.';
    }

    if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email))) {
      throw 'email||The e-mail address is invalid.';
    }

    if (await NextChat.getUsers().getByEmail(email)) {
      throw 'email||The e-mail address already exists.';
    }

    const password: string = req.body.password;
    if (!password || !password.length) {
      throw 'password||You must enter a password for your account.';
    }

    if (password.length < 8 || password.length > 40) {
      throw 'password||The password only contains between 8 and 40 characters.';
    }

    if (!(/^[a-zA-Z0-9.-]*$/.test(password))) {
      throw 'password||he password can not contains special characters or spaces.';
    }

    const repeatPassword: string = req.body.repeat_password;
    if (!repeatPassword || !repeatPassword.length) {
      throw 'repeat_password||You must re enter the password for your account.';
    }

    if (password !== repeatPassword) {
      throw 'repeat_password||The passwords do not match.';
    }

    const gender: string = req.body.gender;
    if (gender !== 'F' && gender !== 'M' && gender !== 'U') {
      throw new Error('The gender is invalid: ' + gender);
    }

    const user: User = await NextChat.getUsers().create(username, email, password, gender === 'F' ? Gender.FEMALE : gender === 'M' ? Gender.MALE : Gender.UNKNOWN);

    const token: UserToken = await user.addToken(TokenType.WEB_ACCESS, Date.now() + 365 * 24 * 60 * 60 * 1000, getIP(req));
    if (!token) {
      throw new Error('The token was not created.');
    }

    if (!(await sendVerifyAccountEmail(user.email, { ip: token.ip }))) {
      throw new Error('The verify account token was not created.');
    }

    await user.addConnection(getIP(req));

    res.status(200).jsonp({
      status: true,
      user_id: user.id,
      token: token.token,
    });

    return;
  } catch (error) {
    sendError('Users', 'Sign Up', res, error);
    return;
  }
};

export const getAuthInfo = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw 'Is not authenticated.';
    }

    res.status(200).jsonp({
      status: true,
      data: await req.user.toArray(),
    });

    return;
  } catch (error) {
    sendError('Users', 'Auth Info', res, error);
    return;
  }
}

export const signIn = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (req.user && req.token) {
      throw 'account||You are authenticated.';
    }

    const account: string = req.body.account;
    if (!account || !account.length) {
      throw 'account||You must enter your username or e-mail address.';
    }

    let user: User = null;
    if (account.includes('@')) {
      user = await NextChat.getUsers().getByEmail(account);

      if (!user) {
        throw 'account||The e-mail address is not an account.';
      }
    } else {
      user = await NextChat.getUsers().getByUsername(account);

      if (!user) {
        throw 'account||The username is not an account.';
      }
    }

    const password: string = req.body.password;
    if (!password || !password.length) {
      throw 'password||You must enter your password account.';
    }

    if (!user.checkPassword(password)) {
      throw 'password||The password is incorrect.';
    }

    const token: UserToken = await user.addToken(TokenType.WEB_ACCESS, Date.now() + 365 * 24 * 60 * 60 * 1000, getIP(req));
    if (!token) {
      throw new Error('The token was not created.');
    }

    await user.addConnection(getIP(req));

    res.status(200).jsonp({
      status: true,
      user_id: user.id,
      token: token.token,
    });

    return;
  } catch (error) {
    sendError('Users', 'Sign In', res, error);
    return;
  }
};

export const sendVerifyToken = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      throw new Error('Is not authenticated.');
    }

    if (req.user.verified) {
      throw new Error('The user already verified.');
    }

    await sendVerifyAccountEmail(req.user.email, { ip: getIP(req) });

    res.status(200).jsonp({
      status: true,
      email: req.user.email.slice(0, 3) + req.user.email.split('').slice(4, req.user.email.indexOf('@')).map((x) => '*').join('') + '@' + req.user.email.split('@')[1],
    });

    return;
  } catch (error) {
    sendError('Users', 'Send Verify Token', res, error);
    return;
  }
};

export const checkVerifyToken = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      throw new Error('Is not authenticated.');
    }

    if (req.user.verified) {
      throw new Error('The user already verified.');
    }

    const verifyToken: string = req.body.token;
    if (!verifyToken || !verifyToken.length) {
      throw new Error('The verify token is null.');
    }

    const token: UserToken = await req.user.getActiveToken(TokenType.VERIFY_ACCOUNT, verifyToken, getIP(req));
    if (!token) {
      throw new Error('The verify token is invalid.');
    }

    await NextChat.getDatabase().getUserTokens().delete({
      id: token.id,
    });

    req.user.verified = true;
    await NextChat.getUsers().save(req.user);

    res.status(200).jsonp({
      status: true,
    });

    return;
  } catch (error) {
    sendError('Users', 'Check Verify Token', res, error);
    return;
  }
};

export const search = async (req: ERequest, res: Response): Promise<void> => {
  try {
    const search: string = req.body.search;
    if (!search || !search.length) {
      throw 'Invalid search word.';
    }

    let page: number = Number(req.body.page);
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    let limit: number = Number(req.body.limit);
    if (isNaN(limit) || limit < 10) {
      limit = 10;
    }

    const users: User[] = await NextChat.getDatabase().getUsers()
      .createQueryBuilder('user')
      .where('user.username LIKE :search OR user.email LIKE :search', {
        search: search + '%',
      })
      .orderBy('user.id', 'DESC')
      .skip((page - 1) * limit)
      .take(page * limit)
      .getMany();

    const data: IUser[] = [];
    if (users.length > 0) {
      for await (let user of users) {
        data.push(await user.toArray());
      }
    }

    res.status(200).jsonp({
      status: true,
      data,
    });

    return;
  } catch (error) {
    sendError('Users', 'Search', res, error);
    return;
  }
};

export const profile = async (req: ERequest, res: Response): Promise<void> => {
  try {
    const profileUsername: string = req.params.username;
    if (!profileUsername) {
      throw new Error('The profile username is null.');
    }

    const profileUser: User = await NextChat.getUsers().getByUsername(profileUsername);
    if (!profileUser) {
      throw 'The user does not exists.';
    }

    if (req.user) {
      res.status(200).jsonp({
        status: true,
        authenticated: true,
        profile: await profileUser.toArray(),
        is_owner: profileUser.id === req.user.id,
      });

      return;
    }

    res.status(200).jsonp({
      status: true,
      authenticated: false,
      profile: await profileUser.toArray(),
    });

    return;
  } catch (error) {
    sendError('Users', 'Profile', res, error);
    return;
  }
};

export const signOut = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      throw 'Is not authenticated.';
    }

    await NextChat.getDatabase().getUserTokens().delete({
      id: req.token.id,
    });

    req.user.online = false;
    req.user.lastOnline = new Date(Date.now()).toString();
    await NextChat.getUsers().save(req.user);

    res.status(200).jsonp({
      status: true,
    });

    return;
  } catch (error) {
    sendError('Users', 'Sign Out', res, error);
    return;
  }
}
