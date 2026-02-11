import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({
    type: 'datetime',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
