class Packet {
  private data: string[];
  private position: number;

  constructor(data: string) {
    this.data = data.split('||');
    this.position = -1;
  }

  async readString(): Promise<string> {
    try {
      if (this.data.length === this.position + 1) {
        throw new Error('No more data.');
      }

      const data: string = this.data[++this.position];
      if (!data.length) {
        throw new Error('No data.');
      }

      return data;
    } catch (error) {
      await Promise.reject(error);
      return '';
    }
  }

  async readInteger(): Promise<number> {
    try {
      const number: number = Number(await this.readString());
      if (isNaN(number)) {
        throw new Error('The data is not an integer.');
      }

      return number;
    } catch (error) {
      await Promise.reject(error);
      return 0;
    }
  }

  async readBoolean(): Promise<boolean> {
    try {
      const data: string = await this.readString();
      if (data !== 'false' && data !== 'true') {
        throw new Error('The data is not a boolean.');
      }

      return data === 'true';
    } catch (error) {
      await Promise.reject(error);
      return false;
    }
  }
}

export default Packet;
