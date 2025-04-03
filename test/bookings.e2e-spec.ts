import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('BookingsController (e2e)', () => {
  let app: INestApplication;
  let movieId: number;
  let showtimeId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a movie first
    const movieData = {
      title: 'Interstellar',
      genre: 'Sci-Fi',
      duration: 169,
      rating: 8.6,
      releaseYear: 2014
    };

    const movieResponse = await request(app.getHttpServer())
      .post('/movies')
      .send(movieData);
    
    movieId = movieResponse.body.id;

    // Create a showtime
    const showtimeData = {
      movieId,
      theater: 'Theater 1',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 169 * 60 * 1000).toISOString(),
      price: 12.99
    };

    const showtimeResponse = await request(app.getHttpServer())
      .post('/showtimes')
      .send(showtimeData);
    
    showtimeId = showtimeResponse.body.id;
  }, 10000);

  afterAll(async () => {
    // Clean up
    if (showtimeId) {
      await request(app.getHttpServer())
        .delete(`/showtimes/${showtimeId}`);
    }
    await request(app.getHttpServer())
      .delete('/movies/Interstellar');
    await app.close();
  }, 10000);

  it('should create a new booking', () => {
    const bookingData = {
      showtimeId,
      seatNumber: 1,
      userId: 'test-user'
    };

    return request(app.getHttpServer())
      .post('/bookings')
      .send(bookingData)
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('bookingId');
        expect(res.body.seatNumber).toBe(bookingData.seatNumber);
      });
  });

  it('should prevent double booking of the same seat', async () => {
    const bookingData = {
      showtimeId,
      seatNumber: 1,
      userId: 'test-user'
    };

    // Create first booking
    await request(app.getHttpServer())
      .post('/bookings')
      .send(bookingData);

    // Try to book the same seat again
    return request(app.getHttpServer())
      .post('/bookings')
      .send(bookingData)
      .expect(409)
      .expect(res => {
        expect(res.body.message).toContain('already booked');
      });
  });

  it('should validate booking data', () => {
    const invalidBookingData = {
      showtimeId,
      seatNumber: -1, // Invalid seat number
      userId: '' // Empty user ID
    };

    return request(app.getHttpServer())
      .post('/bookings')
      .send(invalidBookingData)
      .expect(400);
  });

  it('should handle booking for non-existent showtime', () => {
    const bookingData = {
      showtimeId: 999999, // Non-existent showtime ID
      seatNumber: 1,
      userId: 'test-user'
    };

    return request(app.getHttpServer())
      .post('/bookings')
      .send(bookingData)
      .expect(404);
  });
}); 