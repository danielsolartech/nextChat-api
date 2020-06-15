import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Gender } from '@Core/users/enums';

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 25,
    unique: true,
  })
  username: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
  })
  gender: Gender;

  @Column()
  password: string;

  @Column({
    default: false,
  })
  online: boolean;
}

export default User;
