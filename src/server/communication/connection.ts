import IncomingManager from './incoming';
import { Socket } from 'socket.io';
import User from '@Models/user';
import NextChat from '@NextChat';
import PacketComposer from './outgoing';
import Packet from './incoming/packet';

class Connection {
  private incoming: IncomingManager;

  constructor(
    private socket: Socket,
    private userID: number,
  ) {
    this.incoming = new IncomingManager();
  }

  handleEvents(): void {
    if (this.incoming.getEvents().size) {
      for (let [name, event] of Array.from(this.incoming.getEvents().entries())) {
        this.socket.on(name, async (data: string) => await event.execute(this, new Packet(data)));
      }
    }
  }

  getUserID(): number {
    return this.userID;
  }

  async getUser(): Promise<User> {
    return await NextChat.getUsers().getById(this.getUserID());
  }

  async sendPacket(packet: PacketComposer): Promise<boolean> {
    try {
      await packet.execute();

      this.socket.emit(packet.getName(), packet.getData());

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default Connection;
