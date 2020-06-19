import PacketComposer from '@Communication/outgoing/index';
import User from '@Models/user';
import NextChat from '@NextChat';
import MarcoComposer from './marcoComposer';
import Connection from '@Communication/connection';

class StartConnectionComposer extends PacketComposer {
  constructor(
    private user: User,
    private connection: Connection,
  ) {
    super('start_connection');
  }

  async execute(): Promise<void> {
    try {
      this.user.online = true;
      this.user.lastOnline = new Date(Date.now()).toString();
      await NextChat.getUsers().save(this.user);

      this.connection.handleEvents();

      await this.user.sendPacket(new MarcoComposer(1));
      await this.user.sendNotificationCount();

      console.log('Se ha conectado:', this.user.username);

      this.writeBoolean(true);
      return;
    } catch (error) {
      this.writeBoolean(false);
      return;
    }
  }
}

export default StartConnectionComposer;
