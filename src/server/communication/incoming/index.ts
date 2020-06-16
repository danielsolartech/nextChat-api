import PacketEvent from './packetEvent';
import PoloEvent from './handshake/poloEvent';
import DisconnectEvent from './users/DisconnectEvent';

class IncomingManager {
  private events: Map<string, PacketEvent>;

  constructor() {
    this.events = new Map<string, PacketEvent>();

    this.registerEvents();
  }

  registerEvents(): void {
    this.addEvent('polo', new PoloEvent());
    this.addEvent('disconnect', new DisconnectEvent());
  }

  getEvents(): Map<string, PacketEvent> {
    return this.events;
  }

  hasEvent(name: string): boolean {
    return this.events.has(name);
  }

  addEvent(name: string, packet: PacketEvent): boolean {
    if (this.hasEvent(name)) {
      return false;
    }

    this.events.set(name, packet);
    return this.hasEvent(name);
  }
}

export default IncomingManager;
