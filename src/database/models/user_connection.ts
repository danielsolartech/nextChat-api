import { Entity, OneToOne, JoinColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import User from '@Models/user';

@Entity('user_connections')
class UserConnection {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne((type) => User)
  @JoinColumn()
  user: User;

  @Column()
  ip: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: string;
}

export default UserConnection;
