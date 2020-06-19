import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import User from '@Models/user';

export enum FriendType {
  FRIEND_REQUEST = 'request',
  FRIEND = 'accepted',
  FOLLOW = 'follow',
}

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
    type: 'enum',
    enum: FriendType,
    nullable: false,
  })
  type: FriendType;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: string;
}

export default UserFriend;
