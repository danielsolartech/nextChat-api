import PacketEvent from '../packetEvent';
import Connection from '@Communication/connection';
import Packet from '../packet';
import NextChat from '@NextChat';
import MarcoComposer from '@Communication/outgoing/handshake/marcoComposer';
import User from '@Models/user';

class PoloEvent implements PacketEvent {
  async execute(connection: Connection, packet: Packet): Promise<void> {
    await NextChat.sleep(8000);

    const user: User = await connection.getUser();
    if (user) {
      user.onlineTime += 8;
      await NextChat.getUsers().save(user);
    }

    await connection.sendPacket(new MarcoComposer(await packet.readInteger()));
  }
}

export default PoloEvent;
