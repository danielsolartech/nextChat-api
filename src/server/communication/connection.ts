import { Socket } from 'socket.io';
import User from '@Models/user';
import NextChat from '@NextChat';

class Connection {
  constructor(
    private socket: Socket,
    private userID: number,
  ) { }

  getSocket(): Socket {
    return this.socket;
  }

  getUserID(): number {
    return this.userID;
  }

  async getUser(): Promise<User> {
    return await NextChat.getUsers().getById(this.getUserID());
  }
}

export default Connection;
