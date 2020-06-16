import PacketEvent from '../packetEvent';
import Connection from '@Communication/connection';
import Packet from '../packet';
import NextChat from '@NextChat';
import User from '@Models/user';

class DisconnectEvent implements PacketEvent {
  async execute(connection: Connection, packet: Packet): Promise<void> {
    const user: User = await connection.getUser();
    if (!user) {
      return;
    }

    if (NextChat.getServer().getCommunication().removeConnection(connection)) {
      user.online = false;
      user.lastOnline = new Date(Date.now()).toString();
      await NextChat.getUsers().save(user);

      console.log('Se ha desconectado:', user.username);
    }
  }
}

export default DisconnectEvent;
