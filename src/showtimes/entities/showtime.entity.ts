import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('showtimes')
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  price: number;

  @ManyToOne(() => Movie, (movie) => movie.showtimes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column()
  movieId: number;

  @Column()
  theater: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @OneToMany(() => Booking, (booking) => booking.showtime)
  bookings: Booking[];
} 