import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import User from '@Models/user';

@Entity('user_friends')
class UserFriend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User)
  @JoinColumn({
    name: 'user_one',
  })
  userOne: User;

  @ManyToOne((type) => User)
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
