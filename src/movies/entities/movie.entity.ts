import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Showtime } from '../../showtimes/entities/showtime.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column()
  genre: string;

  @Column()
  duration: number;

  @Column({ type: 'float' })
  rating: number;

  @Column()
  releaseYear: number;

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes: Showtime[];
} 