import * as SocketIO from 'socket.io';
import { Server } from 'http';
import Connection from './connection';
import NextChat from '@NextChat';

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
        const connection = new Connection(socket, socket.handshake.query.user_id);
        const user = await connection.getUser();
         
        if (user) {
          if (this.addConnection(connection)) {
            user.online = true;
            await NextChat.getUsers().save(user);

            console.log('Se ha conectado:', user.username);
            connection.getSocket().emit('ping', { beat: 1 });
          }

          connection.getSocket().on('pong', async (data: { beat: number }) => {
            await NextChat.sleep(5000);
            connection.getSocket().emit('ping', data);
          });

          connection.getSocket().on('disconnect', async () => {
            if (this.removeConnection(connection)) {
              user.online = false;
              user.lastOnline = Date.now().toString();
              await NextChat.getUsers().save(user);

              console.log('Se ha desconectado:', user.username);
            }
          });
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
