import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Popcorn Palace API (e2e)', () => {
  let app: INestApplication;
  let movieId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Movies API', () => {
    it('should create a movie', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .send({
          title: 'The Matrix',
          genre: 'Sci-Fi',
          duration: 136,
          rating: 8.7,
          releaseYear: 1999,
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('The Matrix');
          movieId = res.body.id;
        });
    });

    it('should get all movies', () => {
      return request(app.getHttpServer())
        .get('/movies/all')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should update a movie', () => {
      return request(app.getHttpServer())
        .post(`/movies/update/The Matrix`)
        .send({
          title: 'The Matrix',
          genre: 'Sci-Fi',
          duration: 136,
          rating: 8.8,
          releaseYear: 1999,
        })
        .expect(200);
    });

    it('should delete a movie', () => {
      return request(app.getHttpServer())
        .delete('/movies/The Matrix')
        .expect(200);
    });
  });

  describe('Showtimes API', () => {
    let showtimeId: number;

    it('should create a showtime', () => {
      return request(app.getHttpServer())
        .post('/showtimes')
        .send({
          movieId: movieId,
          price: 12.99,
          theater: 'Theater 1',
          startTime: '2024-03-30T18:00:00Z',
          endTime: '2024-03-30T20:16:00Z',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          showtimeId = res.body.id;
        });
    });

    it('should get showtime by id', () => {
      return request(app.getHttpServer())
        .get(`/showtimes/${showtimeId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(showtimeId);
        });
    });

    it('should prevent overlapping showtimes', () => {
      return request(app.getHttpServer())
        .post('/showtimes')
        .send({
          movieId: movieId,
          price: 12.99,
          theater: 'Theater 1',
          startTime: '2024-03-30T19:00:00Z',
          endTime: '2024-03-30T21:16:00Z',
        })
        .expect(409);
    });

    it('should delete a showtime', () => {
      return request(app.getHttpServer())
        .delete(`/showtimes/${showtimeId}`)
        .expect(200);
    });
  });

  describe('Bookings API', () => {
    let showtimeId: number;

    beforeAll(async () => {
      // Create a showtime for booking tests
      const response = await request(app.getHttpServer())
        .post('/showtimes')
        .send({
          movieId: movieId,
          price: 12.99,
          theater: 'Theater 1',
          startTime: '2024-03-30T18:00:00Z',
          endTime: '2024-03-30T20:16:00Z',
        });
      showtimeId = response.body.id;
    });

    it('should create a booking', () => {
      return request(app.getHttpServer())
        .post('/bookings')
        .send({
          showtimeId: showtimeId,
          seatNumber: 1,
          userId: '84438967-f68f-4fa0-b620-0f08217e76af',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('bookingId');
        });
    });

    it('should prevent double booking of the same seat', () => {
      return request(app.getHttpServer())
        .post('/bookings')
        .send({
          showtimeId: showtimeId,
          seatNumber: 1,
          userId: '84438967-f68f-4fa0-b620-0f08217e76af',
        })
        .expect(409);
    });
  });
}); 