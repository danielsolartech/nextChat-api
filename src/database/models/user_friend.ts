import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import User from '@Models/user';

@Entity('user_friends')
class UserFriend {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne((type) => User)
  @JoinColumn({
    name: 'user_one',
  })
  userOne: User;

  @OneToOne((type) => User)
  @JoinColumn({
    name: 'user_two',
  })
  userTwo: User;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: string;
}

export default UserFriend;
