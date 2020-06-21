import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import User from '@Models/user';

export enum TokenType {
  WEB_ACCESS = 'web_access',
  VERIFY_ACCOUNT = 'verify_account',
  FORGET_ACCOUNT = 'forget_account',
}

@Entity('user_tokens')
class UserToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    type: 'enum',
    enum: TokenType,
    nullable: false,
  })
  type: TokenType;

  @Column()
  token: string;

  @Column({
    nullable: false,
    default: '',
  })
  ip: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  expire: string;
}

export default UserToken;
