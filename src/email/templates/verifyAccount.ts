import EmailManager from '..';
import { Lang } from '@Models/text';
import User from '@Models/user';
import NextChat from '@NextChat';
import UserToken, { TokenType } from '@Models/user_token';

const email: EmailManager = new EmailManager();

interface EmailData {
  ip: string;
}

const sendVerifyAccountEmail = async (to: string, data: EmailData, lang: Lang = Lang.EN): Promise<boolean> => {
  try {
    const user: User = await NextChat.getUsers().getByEmail(to);

    if (!user) {
      throw new Error('The user does not exists.');
    }

    if (user.verified) {
      throw new Error('The user already verified.');
    }

    let token: UserToken = await user.getToken(TokenType.VERIFY_ACCOUNT);
    if (token) {
      throw new Error('The user already has a verify account token.');
    }

    token = await user.addToken(TokenType.VERIFY_ACCOUNT, Date.now() + 24 * 60 * 60 * 1000, data.ip);
    if (!token) {
      throw new Error('The user token was not created.');
    }

    await email
      .from('NOREPLY')
      .to(to)
      .subject('Verify your account')
      .html(`
        <div style="color: #9c27b0 !important;font-size: 1.2rem !important;">
          Hello, ${user.username}!
        </div>
        <div style="line-height: 1.5 !important;letter-spacing: .02em !important;margin-top: 1rem !important;">
          Thank you for create an account in NextChat, if you want to enjoy more features you need verify your account clicking the button below.
        </div>
        <div style="width: 200px !important;margin: 0 auto !important;margin-top: 2rem !important;">
          <a href="http://localhost:8100/verify/account/${token.token}" target="_blank" rel="noopener noreferrer" style="display: block !important;padding: .5rem 1rem !important;border-radius: 4px !important;background-color: #9c27b0 !important;color: white !important;text-align: center !important;text-decoration: none !important;">
            Verify your account
          </a>
        </div>
      `)
      .send();

    return true;
  } catch (error) {
    await Promise.reject(error);
    return false;
  }
};

export default sendVerifyAccountEmail;
