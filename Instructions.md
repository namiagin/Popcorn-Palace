# Popcorn Palace Movie Ticket Booking System - Setup Instructions

## ⚙️ Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v16 or later)
- npm (v7 or later)
- Docker and Docker Compose (for PostgreSQL database)

## Setup and Installation

1. Clone the Repository
```bash
git clone https://github.com/namiagin/Popcorn-Palace.git
```

2. Navigate to the project directory

```bash
cd popcorn_palace_typescript
```

3. Install dependencies

```bash
npm install
```

4. Start the PostgreSQL database using Docker Compose

```bash
docker-compose up -d
```

This will start a PostgreSQL instance with the following configuration:
- Username: popcorn-palace
- Password: popcorn-palace
- Database: popcorn-palace
- Port: 5432

## Building the Application

Build the NestJS application with:

```bash
npm run build
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

This starts the application in development mode with hot-reloading enabled.

### Production Mode

```bash
npm run start:prod
```

This starts the application in production mode.

## Testing

### Running Unit Tests

```bash
npm run test
```

### Running E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

This provides interactive documentation for all the available API endpoints.

## API Endpoints

### Movies API

- `GET /movies/all` - Get all movies
- `POST /movies` - Add a new movie
- `POST /movies/update/{movieTitle}` - Update a movie
- `DELETE /movies/{movieTitle}` - Delete a movie

### Showtimes API

- `GET /showtimes/{showtimeId}` - Get showtime by ID
- `POST /showtimes` - Add a new showtime
- `POST /showtimes/update/{showtimeId}` - Update a showtime
- `DELETE /showtimes/{showtimeId}` - Delete a showtime

### Bookings API

- `POST /bookings` - Book a ticket for a showtime

## Database Schema

The application uses three main entities:

1. **Movie** - Stores movie information (title, genre, duration, rating, releaseYear)
2. **Showtime** - Stores showtime information (movieId, theater, startTime, endTime, price)
3. **Booking** - Stores booking information (showtimeId, seatNumber, userId)

## Notes

- The database is configured to synchronize the schema automatically in development mode (synchronize: true). For production, you should set this to false and use migrations instead.
- The application includes validation for all inputs to ensure data integrity.
- The relationships between entities are properly set up with cascading deletes.
