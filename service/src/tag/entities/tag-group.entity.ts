import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Tag } from './tag.entity';

@Entity()
export class TagGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Tag, (tag) => tag.group)
  tags: Tag[];
}
