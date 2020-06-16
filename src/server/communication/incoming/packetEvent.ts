import Connection from '../connection';
import Packet from './packet';

interface PacketEvent {
  execute(connection: Connection, packet: Packet): Promise<void>;
}

export default PacketEvent;
