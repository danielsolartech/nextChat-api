import { Entity, PrimaryColumn, Column } from 'typeorm';

export enum Lang {
  ES = 'spanish',
  EN = 'english',
}

@Entity('texts')
class Text {
  @PrimaryColumn()
  name: string;

  @Column({
    type: 'enum',
    enum: Lang,
    nullable: false,
    default: Lang.EN,
  })
  lang: Lang;

  @Column()
  value: string;
}

export default Text;
