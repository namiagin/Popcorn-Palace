import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Showtime } from '../../showtimes/entities/showtime.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  bookingId: string;

  @Column()
  showtimeId: number;

  @ManyToOne(() => Showtime, (showtime) => showtime.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'showtimeId' })
  showtime: Showtime;

  @Column()
  seatNumber: number;

  @Column()
  userId: string;
} 