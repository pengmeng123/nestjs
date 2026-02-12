import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  email: string;

  @Column({ type: 'varchar', nullable: false, length: 255 })
  password: string;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: UserProfile;

  @Column({
    type: 'datetime',
    name: 'createDate',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createDate: Date;
}
