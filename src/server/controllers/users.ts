import { Request, Response } from 'express';
import { generateCode } from '@Core/utils';
import User from '@Models/user';
import NextChat from '@NextChat';
import { sendError } from '@Core/server/responses';
import { Gender, TokenType } from '@Core/users/enums';
import UserToken from '@Models/user_token';

export const generateCaptcha = (req: Request, res: Response): void => {
  res.status(200).jsonp({
    code: generateCode(6),
  });
};

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
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

    const captcha: string = req.body.captcha;
    if (!captcha || !captcha.length) {
      throw 'captcha||You must enter the captcha code.';
    }

    const captchaAnswer: string = req.body.captcha_answer;
    if (!captchaAnswer || captchaAnswer.length !== 6) {
      throw new Error('The captcha answer is invalid');
    }

    if (captcha !== captchaAnswer) {
      throw 'captcha||The captcha code is incorrect.';
    }

    const ip: string = req.header('x-forwarded-for') ? req.header('x-forwarded-for')[0] : req.connection.remoteAddress || '';
    if (!ip || !ip.length) {
      throw new Error('Invalid ip.');
    }

    const user: User = await NextChat.getUsers().create(username, email, password, gender === 'F' ? Gender.FEMALE : gender === 'M' ? Gender.MALE : Gender.UNKNOWN);

    const token: UserToken = await user.addToken(TokenType.WEB_ACCESS, Date.now() + 1 * 60 * 60 * 1000, ip);
    if (!token) {
      throw new Error('The token was not created.');
    }

    await user.addConnection(ip);

    res.status(200).jsonp({
      status: true,
      user_id: user.id,
      token: token.token,
    });

    return;
  } catch (error) {
    sendError(res, error);
    return;
  }
};

export const getAuthInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userID: string = req.body.user_id;
    const token: string = req.body.token;
    const ip: string = req.header('x-forwarded-for') ? req.header('x-forwarded-for')[0] : req.connection.remoteAddress || '';

    if (!userID || !ip) {
      throw 'The user id is required.';
    }

    if (!token) {
      throw 'The token is required.';
    }

    const id: number = Number(userID);
    if (!id || id <= 0 || isNaN(id)) {
      throw 'The user id is invalid.';
    }

    const user: User = await NextChat.getUsers().getById(id);
    if (!user) {
      throw 'The user does not exists.';
    }

    if (await user.getActiveToken(TokenType.WEB_ACCESS, token, ip) == null) {
      throw 'The token is invalid.';
    }

    res.status(200).jsonp({
      status: true,
      data: user.toArray(),
    });

    return;
  } catch (error) {
    sendError(res, error);
    return;
  }
}

export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
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

    const ip: string = req.header('x-forwarded-for') ? req.header('x-forwarded-for')[0] : req.connection.remoteAddress || '';
    if (!ip || !ip.length) {
      throw new Error('Invalid ip.');
    }

    const token: UserToken = await user.addToken(TokenType.WEB_ACCESS, Date.now() + 1 * 60 * 60 * 1000, ip);
    if (!token) {
      throw new Error('The token was not created.');
    }

    await user.addConnection(ip);

    res.status(200).jsonp({
      status: true,
      user_id: user.id,
      token: token.token,
    });

    return;
  } catch (error) {
    sendError(res, error);
    return;
  }
};
