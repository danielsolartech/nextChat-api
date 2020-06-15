import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import User from '@Models/user';
import { TokenType } from '@Core/users/enums';

@Entity('user_tokens')
class UserToken {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne((type) => User)
  @JoinColumn()
  user: User;

  @Column()
  type: string;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  token: TokenType;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created: string;

  @Column({
    type: 'timestamp',
  })
  expire: number;
}

export default UserToken;
