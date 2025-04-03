import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Set up global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Popcorn Palace API')
    .setDescription(`
      ## Movie Ticket Booking System API

      This API provides endpoints for managing movies, showtimes, and bookings in a movie theater system.

      ### Movies
      - Create, read, update, and delete movies
      - Each movie has a title, genre, duration, rating, and release year
      - Example movie:
        \`\`\`json
        {
          "title": "Inception",
          "genre": "Sci-Fi",
          "duration": 148,
          "rating": 8.8,
          "releaseYear": 2010
        }
        \`\`\`

      ### Showtimes
      - Schedule movie showtimes in theaters
      - Each showtime has a movie, theater, start time, end time, and price
      - Example showtime:
        \`\`\`json
        {
          "movieId": 1,
          "theater": "Theater 1",
          "startTime": "2024-03-30T18:00:00Z",
          "endTime": "2024-03-30T20:28:00Z",
          "price": 12.99
        }
        \`\`\`

      ### Bookings
      - Book seats for specific showtimes
      - Each booking requires a showtime ID, seat number, and user ID
      - Example booking:
        \`\`\`json
        {
          "showtimeId": 1,
          "seatNumber": 15,
          "userId": "84438967-f68f-4fa0-b620-0f08217e76af"
        }
        \`\`\`
    `)
    .setVersion('1.0')
    .addTag('movies', 'Endpoints for managing movies')
    .addTag('showtimes', 'Endpoints for managing movie showtimes')
    .addTag('bookings', 'Endpoints for managing ticket bookings')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Serve static files from the 'public' directory
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    index: false,
  });

  // Serve index.html for the root route
  app.getHttpAdapter().get('/', (req, res: Response) => {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });
  
  await app.listen(3000);
}
bootstrap();
