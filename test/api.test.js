const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    // 1. Create a movie
    console.log('Creating a movie...');
    const movieResponse = await axios.post(`${API_URL}/movies`, {
      title: 'The Matrix',
      genre: 'Sci-Fi',
      duration: 136,
      rating: 8.7,
      releaseYear: 1999
    });
    const movieId = movieResponse.data.id;
    console.log('Movie created:', movieResponse.data);

    // 2. Get all movies
    console.log('\nGetting all movies...');
    const moviesResponse = await axios.get(`${API_URL}/movies/all`);
    console.log('All movies:', moviesResponse.data);

    // 3. Create a showtime
    console.log('\nCreating a showtime...');
    const showtimeResponse = await axios.post(`${API_URL}/showtimes`, {
      movieId: movieId,
      price: 12.99,
      theater: 'Theater 1',
      startTime: '2024-03-30T18:00:00Z',
      endTime: '2024-03-30T20:16:00Z'
    });
    const showtimeId = showtimeResponse.data.id;
    console.log('Showtime created:', showtimeResponse.data);

    // 4. Try to create overlapping showtime (should fail)
    console.log('\nTrying to create overlapping showtime...');
    try {
      await axios.post(`${API_URL}/showtimes`, {
        movieId: movieId,
        price: 12.99,
        theater: 'Theater 1',
        startTime: '2024-03-30T19:00:00Z',
        endTime: '2024-03-30T21:16:00Z'
      });
    } catch (error) {
      console.log('Overlapping showtime creation failed as expected:', error.response.data);
    }

    // 5. Create a booking
    console.log('\nCreating a booking...');
    const bookingResponse = await axios.post(`${API_URL}/bookings`, {
      showtimeId: showtimeId,
      seatNumber: 1,
      userId: '84438967-f68f-4fa0-b620-0f08217e76af'
    });
    console.log('Booking created:', bookingResponse.data);

    // 6. Try to book the same seat again (should fail)
    console.log('\nTrying to book the same seat again...');
    try {
      await axios.post(`${API_URL}/bookings`, {
        showtimeId: showtimeId,
        seatNumber: 1,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af'
      });
    } catch (error) {
      console.log('Double booking failed as expected:', error.response.data);
    }

    // 7. Update movie
    console.log('\nUpdating movie...');
    await axios.post(`${API_URL}/movies/update/The Matrix`, {
      title: 'The Matrix',
      genre: 'Sci-Fi',
      duration: 136,
      rating: 8.8,
      releaseYear: 1999
    });
    console.log('Movie updated successfully');

    // 8. Delete showtime
    console.log('\nDeleting showtime...');
    await axios.delete(`${API_URL}/showtimes/${showtimeId}`);
    console.log('Showtime deleted successfully');

    // 9. Delete movie
    console.log('\nDeleting movie...');
    await axios.delete(`${API_URL}/movies/The Matrix`);
    console.log('Movie deleted successfully');

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testAPI(); 