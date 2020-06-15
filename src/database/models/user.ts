import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Gender } from '@Core/users/enums';

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 25,
    nullable: false,
    unique: true,
  })
  username: string;

  @Column({
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: false,
    default: Gender.UNKNOWN,
  })
  gender: Gender;

  @Column()
  password: string;

  @Column({
    nullable: false,
    default: false,
  })
  online: boolean;

  @Column({
    name: 'last_online',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastOnline: string;
}

export default User;
