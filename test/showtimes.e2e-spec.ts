import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ShowtimesController (e2e)', () => {
  let app: INestApplication;
  let movieId: number;
  let showtimeId: number;

  const movieData = {
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: 148,
    rating: 8.8,
    releaseYear: 2010
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const showtimeData = {
    movieId: 0, // Will be set after movie creation
    price: 12.99,
    theater: 'Theater 1',
    startTime: tomorrow.toISOString(),
    endTime: new Date(tomorrow.getTime() + 148 * 60 * 1000).toISOString(), // Tomorrow + duration
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Clean up any existing test data
    try {
      await request(app.getHttpServer())
        .delete('/movies/Inception');
    } catch (error) {
      // Ignore errors if movie doesn't exist
    }

    // Create a movie first
    const movieResponse = await request(app.getHttpServer())
      .post('/movies')
      .send(movieData);
    
    movieId = movieResponse.body.id;
    showtimeData.movieId = movieId;
  }, 10000);

  afterAll(async () => {
    // Clean up
    if (showtimeId) {
      try {
        await request(app.getHttpServer())
          .delete(`/showtimes/${showtimeId}`);
      } catch (error) {
        // Ignore errors if showtime doesn't exist
      }
    }
    await request(app.getHttpServer())
      .delete('/movies/Inception');
    await app.close();
  }, 10000);

  it('should create a new showtime', async () => {
    const response = await request(app.getHttpServer())
      .post('/showtimes')
      .send(showtimeData)
      .expect(201);

    expect(response.body.id).toBeDefined();
    showtimeId = response.body.id;
  });

  it('should prevent overlapping showtimes', async () => {
    const overlappingData = {
      ...showtimeData,
      startTime: new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes after first showtime
      endTime: new Date(tomorrow.getTime() + 178 * 60 * 1000).toISOString(), // Duration + 30 minutes
    };

    await request(app.getHttpServer())
      .post('/showtimes')
      .send(overlappingData)
      .expect(409)
      .expect(res => {
        expect(res.body.message).toContain('already a showtime scheduled');
      });
  });

  it('should get a showtime by ID', async () => {
    await request(app.getHttpServer())
      .get(`/showtimes/${showtimeId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.id).toBe(showtimeId);
        expect(res.body.theater).toBe(showtimeData.theater);
        expect(res.body.price).toBe(showtimeData.price);
      });
  });

  it('should update a showtime', async () => {
    const updateData = {
      ...showtimeData,
      price: 14.99,
    };

    await request(app.getHttpServer())
      .put(`/showtimes/${showtimeId}`)
      .send(updateData)
      .expect(200)
      .expect(res => {
        expect(res.body.price).toBe(updateData.price);
      });
  });

  it('should delete a showtime', async () => {
    await request(app.getHttpServer())
      .delete(`/showtimes/${showtimeId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.message).toBe('Showtime deleted successfully');
      });
  });
}); 