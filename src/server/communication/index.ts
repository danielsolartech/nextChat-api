import * as SocketIO from 'socket.io';
import { Server } from 'http';
import Connection from './connection';
import NextChat from '@NextChat';
import MarcoComposer from '@Communication/outgoing/handshake/marcoComposer';

class CommunicationManager {
  private server: SocketIO.Server;
  private connections: Connection[];

  constructor(http: Server) {
    this.server = SocketIO(http);
    this.connections = [];
  }

  async initialize(): Promise<void> {
    try {
      this.server.on('connection', async (socket: SocketIO.Socket) => {
        const connection = new Connection(socket, Number(socket.handshake.query.user_id) || 0);
        const user = await connection.getUser();

        if (user) {
          if (this.addConnection(connection)) {
            user.online = true;
            await NextChat.getUsers().save(user);

            console.log('Se ha conectado:', user.username);
            await user.sendPacket(new MarcoComposer(1));

            connection.handleEvents();
          }
        }
      });
    } catch (error) {
      await Promise.reject(error);
      return;
    }
  }

  getConnection(userID: number): Connection {
    return this.connections.find((connection: Connection) => connection.getUserID() === userID);
  }

  hasConnection(connection: Connection): boolean {
    return this.getConnection(connection.getUserID()) != null;
  }

  addConnection(connection: Connection): boolean {
    if (this.hasConnection(connection)) {
      return false;
    }

    this.connections.push(connection);
    return this.hasConnection(connection);
  }

  removeConnection(connection: Connection): boolean {
    if (!this.hasConnection(connection)) {
      return false;
    }

    this.connections.splice(this.connections.findIndex((conn: Connection) => conn.getUserID() === connection.getUserID()), 1);
    return !this.hasConnection(connection);
  }
}

export default CommunicationManager;
