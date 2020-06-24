import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import User from './user';
import * as moment from 'moment';

export enum ActionType {
  CHANGE_PASSWORD = 'change_password',
  CHANGE_USERNAME = 'change_username',
}

@Entity('user_actions')
class UserAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ActionType,
    nullable: false,
  })
  type: ActionType;

  @ManyToOne((type) => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column()
  ip: string;

  @Column({
    name: 'added_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  addedTime: string;

  checkTime(days: number, hours: number, minutes: number, seconds: number): boolean {
    const daysMS: number = days * 24 * 60 * 60 * 1000;
    const hoursMS: number = hours * 60 * 60 * 1000;
    const minutesMS: number = minutes * 60 * 1000;
    const miliseconds: number = daysMS + hoursMS + minutesMS + (seconds * 1000);

    return moment(this.addedTime).isSameOrAfter(Date.now() - miliseconds);
  }
}

export default UserAction;
