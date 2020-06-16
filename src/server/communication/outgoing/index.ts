class PacketComposer {
  private data: string;

  constructor(
    private name: string,
  ) {
    this.data = '';
  }

  private write(data: string | number | boolean): void {
    if (this.data.length) {
      this.data += '||';
    }

    this.data += data;
  }

  protected writeString(str: string): void {
    this.write(str);
  }

  protected writeInteger(num: number): void {
    this.write(num);
  }

  protected writeBoolean(bool: boolean): void {
    this.write(bool);
  }

  getName(): string {
    return this.name;
  }

  getData(): string {
    return this.data;
  }

  async execute(): Promise<void> { }
}

export default PacketComposer;
