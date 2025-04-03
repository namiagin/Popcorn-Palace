import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let createdMovieId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a default movie for testing
    const defaultMovie = {
      title: 'Default Movie',
      genre: 'Drama',
      duration: 120,
      rating: 8.0,
      releaseYear: 2020
    };

    try {
      await request(app.getHttpServer())
        .post('/movies')
        .send(defaultMovie);
    } catch (error) {
      // Ignore if movie already exists
    }
  }, 30000);

  beforeEach(async () => {
    // Clean up any existing test movie, but not the default movie
    try {
      const response = await request(app.getHttpServer())
        .get('/movies/all');
      
      const testMovie = response.body.find(movie => movie.title === 'Test Movie');
      if (testMovie) {
        await request(app.getHttpServer())
          .delete(`/movies/id/${testMovie.id}`);
      }
    } catch (error) {
      // Ignore errors if movie doesn't exist
    }
  }, 30000);

  afterAll(async () => {
    // Clean up any remaining test movie, but not the default movie
    try {
      const response = await request(app.getHttpServer())
        .get('/movies/all');
      
      const testMovie = response.body.find(movie => movie.title === 'Test Movie');
      if (testMovie) {
        await request(app.getHttpServer())
          .delete(`/movies/id/${testMovie.id}`);
      }
    } catch (error) {
      // Ignore errors if movie doesn't exist
    }
    await app.close();
  }, 30000);

  it('should validate movie data when creating', () => {
    const invalidMovieData = {
      title: '',  // Empty title
      genre: 'Sci-Fi',
      duration: -136,  // Negative duration
      rating: 11,  // Rating > 10
      releaseYear: 1800  // Invalid year
    };

    return request(app.getHttpServer())
      .post('/movies')
      .send(invalidMovieData)
      .expect(400);
  }, 30000);

  it('should create a new movie', async () => {
    const movieData = {
      title: 'Test Movie',
      genre: 'Sci-Fi',
      duration: 136,
      rating: 8.7,
      releaseYear: 1999
    };

    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(movieData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(movieData.title);
    createdMovieId = response.body.id;
  }, 30000);

  it('should prevent creating a movie with duplicate title', async () => {
    const movieData = {
      title: 'Test Movie',
      genre: 'Action',
      duration: 120,
      rating: 7.5,
      releaseYear: 2000
    };

    // First create a movie
    await request(app.getHttpServer())
      .post('/movies')
      .send(movieData)
      .expect(201);

    // Try to create another movie with the same title
    await request(app.getHttpServer())
      .post('/movies')
      .send(movieData)
      .expect(409);
  }, 30000);

  it('should get all movies', () => {
    return request(app.getHttpServer())
      .get('/movies/all')
      .expect(200)
      .expect(res => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  }, 30000);

  it('should update a movie', async () => {
    // First create a movie
    const movieData = {
      title: 'Test Movie',
      genre: 'Action',
      duration: 120,
      rating: 7.5,
      releaseYear: 2000
    };

    const createResponse = await request(app.getHttpServer())
      .post('/movies')
      .send(movieData)
      .expect(201);

    const updateData = {
      title: 'Test Movie',
      genre: 'Science Fiction',
      duration: 136,
      rating: 8.8,
      releaseYear: 1999
    };

    return request(app.getHttpServer())
      .put(`/movies/Test Movie`)
      .send(updateData)
      .expect(200)
      .expect(res => {
        expect(res.body.message).toBe('Movie updated successfully');
      });
  }, 30000);

  it('should delete a movie', async () => {
    // First create a movie
    const movieData = {
      title: 'Test Movie',
      genre: 'Action',
      duration: 120,
      rating: 7.5,
      releaseYear: 2000
    };

    await request(app.getHttpServer())
      .post('/movies')
      .send(movieData)
      .expect(201);

    return request(app.getHttpServer())
      .delete('/movies/Test Movie')
      .expect(200)
      .expect(res => {
        expect(res.body.message).toBe('Movie deleted successfully');
      });
  }, 30000);
}); 