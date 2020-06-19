import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import User from '@Models/user';

export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPT = 'friend_accept',
}

export interface NotificationMessage {
  actor_id?: number;
  message?: string;
}

@Entity('user_notifications')
class UserNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
    nullable: false,
  })
  type: NotificationType;

  @Column('simple-json')
  message: NotificationMessage;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  readed: boolean;
}

export default UserNotification;
