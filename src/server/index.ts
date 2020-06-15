import * as Express from 'express';
import * as HTTP from 'http';
import CommunicationManager from './communication';
import Setting from '@Models/setting';
import NextChat from '@NextChat';
import { Repository } from 'typeorm';
import { isNumber } from 'util';

class ServerManager {
  private app: Express.Express;
  private http: HTTP.Server;
  private communication: CommunicationManager;
  private settings: { host: string, port: number, url: string };

  constructor() {
    this.app = Express();
    this.http = HTTP.createServer(this.app);
    this.communication = new CommunicationManager(this.http);
    this.settings = { host: 'localhost', port: 3000, url: 'http://localhost:3000/' };
  }

  async initialize(): Promise<void> {
    try {
      const settings: Repository<Setting> = NextChat.getDatabase().getSettings();
      let setting: Setting = new Setting();

      let host: Setting = await settings.findOne({ name: 'server_host' });
      if (!host) {
        setting.name = 'server_host';
        setting.value = 'localhost';

        host = await settings.save(setting);
      }

      let port: Setting = await settings.findOne({ name: 'server_port' });
      if (!port) {
        setting.name = 'server_port';
        setting.value = '3000';

        port = await settings.save(setting);
      }

      let url: Setting = await settings.findOne({ name: 'server_url' });
      if (!url) {
        setting.name = 'server_url';
        setting.value = 'http://localhost:3000/';

        url = await settings.save(setting);
      }

      if (host && port && url && isNumber(port.value)) {
        this.settings = {
          host: host.value,
          port: Number(port.value),
          url: url.value,
        };
      }

      await this.getCommunication().initialize();
    } catch (error) {
      await Promise.reject(error);
      return;
    }
  }

  listen(): void {
    this.getHTTP().listen(this.settings.port, this.settings.host, () => {
      console.log('Server initialized on ' + this.settings.url);
    });
  }

  getApp(): Express.Express {
    return this.app;
  }

  getHTTP(): HTTP.Server {
    return this.http;
  }

  getCommunication(): CommunicationManager {
    return this.communication;
  }
}

export default ServerManager;
