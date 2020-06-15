import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('settings')
class Setting {
  @PrimaryColumn({
    type: 'varchar',
    length: '200',
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: '500',
  })
  value: string;
}

export default Setting;
