import { Response } from 'express';
import { ERequest } from '../index';
import { sendError } from '../responses';
import User, { IUser } from '@Models/user';
import NextChat from '@NextChat';

export const followers = async (req: ERequest, res: Response): Promise<void> => {
  try {
    let limit: number = Number(req.params.limit);
    if (!limit || isNaN(limit) || limit < 3) {
      limit = 3;
    }

    const usersTop = await NextChat.getDatabase().getUserFriends()
      .createQueryBuilder('uf')
      .select('uf.userTwo', 'user_id')
      .groupBy('uf.userTwo')
      .orderBy('COUNT(uf.userTwo)', 'DESC')
      .limit(limit)
      .getRawMany();

    const users: User[] = [];
    if (usersTop.length) {
      for await (let user of usersTop) {
        users.push(await NextChat.getUsers().getById(user.user_id));
      }
    }

    const data: IUser[] = [];
    if (users.length) {
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
    sendError('Tops', 'Followers', res, error);
    return;
  }
};