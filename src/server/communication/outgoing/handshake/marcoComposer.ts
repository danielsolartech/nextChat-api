import PacketComposer from '..';

class MarcoComposer extends PacketComposer {
  constructor(
    private beat: number,
  ) {
    super('marco');
  }

  async execute(): Promise<void> {
    this.writeInteger(this.beat);
  }
}

export default MarcoComposer;
