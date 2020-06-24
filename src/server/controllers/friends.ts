import { ERequest } from '..';
import { Response } from 'express';
import { sendError } from '@Core/server/responses';
import User from '@Models/user';
import NextChat from '@NextChat';
import UserFriend, { FriendType } from '@Models/user_friend';
import { NotificationType } from '@Models/user_notification';
import UpdateProfileButtonsComposer from '@Communication/outgoing/users/friends/updateProfileButtonsComposer';

export const followUser = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      throw new Error('Is not authenticated.');
    }

    const userTo: string = req.body.username;
    if (!userTo || !userTo.length) {
      throw new Error('The user to request username is required.');
    }

    const user: User = await NextChat.getUsers().getByUsername(userTo);
    if (!user) {
      throw new Error('The user to request is not valid.');
    }

    if (await req.user.isFollowing(user)) {
      throw new Error('The user already follows him.');
    }

    await NextChat.getDatabase().getUserFriends().insert({
      userOne: req.user,
      userTwo: user,
      type: FriendType.FOLLOW,
    });

    await user.sendNotification(NotificationType.NEW_FOLLOWER, { actor_id: req.user.id });

    if (user.online) {
      await user.sendPacket(new UpdateProfileButtonsComposer({
        type: 'FOLLOW',
        userOne: req.user,
        userTwo: user,
      }));
    }

    res.status(200).jsonp({
      status: true,
    });

    return;
  } catch (error) {
    sendError('Friends', 'Follow User', res, error);
    return;
  }
};

export const unFollowUser = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      throw new Error('Is not authenticated.');
    }

    const userTo: string = req.body.username;
    if (!userTo || !userTo.length) {
      throw new Error('The user to request username is required.');
    }

    const user: User = await NextChat.getUsers().getByUsername(userTo);
    if (!user) {
      throw new Error('The user to request is not valid.');
    }

    const following: UserFriend = await req.user.isFollowing(user);
    if (!following) {
      throw new Error('The user does not follow him.');
    }

    await user.removeNotification(NotificationType.NEW_FOLLOWER, { actor_id: req.user.id })

    await NextChat.getDatabase().getUserFriends().delete({ id: following.id });

    if (user.online) {
      await user.sendPacket(new UpdateProfileButtonsComposer({
        type: 'FOLLOW',
        userOne: req.user,
        userTwo: user,
      }));
    }

    res.status(200).jsonp({
      status: true,
    });

    return;
  } catch (error) {
    sendError('Friends', 'Un Follow User', res, error);
    return;
  }
};

export const sendFriendRequest = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      throw new Error('Is not authenticated.');
    }

    const userTo: string = req.body.username;
    if (!userTo || !userTo.length) {
      throw new Error('The user to request username is required.');
    }

    const user: User = await NextChat.getUsers().getByUsername(userTo);
    if (!user) {
      throw new Error('The user to request is not valid.');
    }

    if (await req.user.isFriend(user)) {
      throw new Error('The users are friends.');
    }

    if (await req.user.isFriendRequest(user)) {
      throw new Error('The users are in friend request.');
    }

    await NextChat.getDatabase().getUserFriends().insert({
      userOne: req.user,
      userTwo: user,
      type: FriendType.FRIEND_REQUEST,
    });

    await user.sendNotification(NotificationType.FRIEND_REQUEST, { actor_id: req.user.id });

    if (req.user.online) {
      await req.user.sendPacket(new UpdateProfileButtonsComposer({
        type: 'FRIEND_REQUEST',
        userOne: user,
        userTwo: req.user,
        options: true,
      }));
    }

    if (user.online) {
      await user.sendPacket(new UpdateProfileButtonsComposer({
        type: 'FRIEND_REQUEST',
        userOne: req.user,
        userTwo: user,
      }));
    }

    res.status(200).jsonp({
      status: true,
    });

    return;
  } catch (error) {
    sendError('Friends', 'Send Friend Request', res, error);
    return;
  }
};

export const acceptFriendRequest = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      throw new Error('Is not authenticated.');
    }

    const userTo: string = req.body.username;
    if (!userTo || !userTo.length) {
      throw new Error('The user to request username is required.');
    }

    const user: User = await NextChat.getUsers().getByUsername(userTo);
    if (!user) {
      throw new Error('The user to request is not valid.');
    }

    if (await req.user.isFriend(user)) {
      throw new Error('The users are friends.');
    }

    const friendRequested: UserFriend = await req.user.isFriendRequest(user);
    if (!friendRequested) {
      throw new Error('The user has not friend request.');
    }

    await NextChat.getDatabase().getUserFriends().delete({ id: friendRequested.id });

    if (req.user.id === friendRequested.userTwo.id) {
      await req.user.removeNotification(NotificationType.FRIEND_REQUEST, { actor_id: user.id });
    } else if (req.user.id === friendRequested.userOne.id) {
      await user.removeNotification(NotificationType.FRIEND_REQUEST, { actor_id: req.user.id });
    }

    await NextChat.getDatabase().getUserFriends().insert({
      userOne: req.user,
      userTwo: user,
      type: FriendType.FRIEND,
    });

    await user.sendNotification(NotificationType.FRIEND_ACCEPT, { actor_id: req.user.id });

    if (user.online) {
      await user.sendPacket(new UpdateProfileButtonsComposer({
        type: 'FRIEND',
        userOne: req.user,
        userTwo: user,
      }));
    }

    res.status(200).jsonp({
      status: true,
    });

    return;
  } catch (error) {
    sendError('Friends', 'Accept Friend Request', res, error);
    return;
  }
};

export const declineFriendRequest = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      throw new Error('Is not authenticated.');
    }

    const userTo: string = req.body.username;
    if (!userTo || !userTo.length) {
      throw new Error('The user to request username is required.');
    }

    const user: User = await NextChat.getUsers().getByUsername(userTo);
    if (!user) {
      throw new Error('The user to request is not valid.');
    }

    if (await req.user.isFriend(user)) {
      throw new Error('The users are friends.');
    }

    const friendRequested: UserFriend = await req.user.isFriendRequest(user);
    if (!friendRequested) {
      throw new Error('The user has not friend request.');
    }

    await NextChat.getDatabase().getUserFriends().delete({ id: friendRequested.id });

    if (req.user.online) {
      await req.user.sendPacket(new UpdateProfileButtonsComposer({
        type: 'FRIEND_REQUEST',
        userOne: user,
        userTwo: req.user,
      }));
    }

    if (user.online) {
      await user.sendPacket(new UpdateProfileButtonsComposer({
        type: 'FRIEND_REQUEST',
        userOne: req.user,
        userTwo: user,
      }));
    }

    if (req.user.id === friendRequested.userTwo.id) {
      await req.user.removeNotification(NotificationType.FRIEND_REQUEST, { actor_id: user.id });
    } else if (req.user.id === friendRequested.userOne.id) {
      await user.removeNotification(NotificationType.FRIEND_REQUEST, { actor_id: req.user.id });
    }

    res.status(200).jsonp({
      status: true,
    });

    return;
  } catch (error) {
    sendError('Friends', 'Decline Friend Request', res, error);
    return;
  }
};

export const deleteFriend = async (req: ERequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      throw new Error('Is not authenticated.');
    }

    const userTo: string = req.body.username;
    if (!userTo || !userTo.length) {
      throw new Error('The user to request username is required.');
    }

    const user: User = await NextChat.getUsers().getByUsername(userTo);
    if (!user) {
      throw new Error('The user to request is not valid.');
    }

    const friend: UserFriend = await req.user.isFriend(user);
    if (!friend) {
      throw new Error('The users are not friends.');
    }

    await NextChat.getDatabase().getUserFriends().delete({ id: friend.id });

    if (user.online) {
      await user.sendPacket(new UpdateProfileButtonsComposer({
        type: 'FRIEND',
        userOne: req.user,
        userTwo: user,
      }));
    }

    if (req.user.id === friend.userTwo.id) {
      await req.user.removeNotification(NotificationType.FRIEND_ACCEPT, { actor_id: user.id });
    } else if (req.user.id === friend.userOne.id) {
      await user.removeNotification(NotificationType.FRIEND_ACCEPT, { actor_id: req.user.id });
    }

    res.status(200).jsonp({
      status: true,
    });

    return;
  } catch (error) {
    sendError('Friends', 'Delete Friend', res, error);
    return;
  }
};
