import * as Express from 'express';
import * as HTTP from 'http';
import CommunicationManager from './communication';
import Setting from '@Models/setting';
import NextChat from '@NextChat';
import { Repository } from 'typeorm';
import * as Cors from 'cors';
import UsersRoutes from '@Routes/users';

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

      let portS: Setting = await settings.findOne({ name: 'server_port' });
      if (!portS) {
        setting.name = 'server_port';
        setting.value = '3000';

        portS = await settings.save(setting);
      }

      let url: Setting = await settings.findOne({ name: 'server_url' });
      if (!url) {
        setting.name = 'server_url';
        setting.value = 'http://localhost:3000/';

        url = await settings.save(setting);
      }

      if (host && portS && url) {
        const port: number = Number(portS.value);

        if (port && !isNaN(port)) {
          this.settings = {
            host: host.value,
            port,
            url: url.value,
          };
        }
      }

      await this.getCommunication().initialize();

      this.getApp().use(Cors({
        optionsSuccessStatus: 200,
      }));

      this.getApp().use(Express.urlencoded({ extended: true }));
      this.getApp().use(Express.json());

      this.getApp().use('/users/', UsersRoutes);
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
