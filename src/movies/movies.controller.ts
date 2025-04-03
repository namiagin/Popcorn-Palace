import { Controller, Get, Post, Body, Param, Delete, HttpCode, Put } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Movie } from './entities/movie.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all movies' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns an array of all movies',
    type: [Movie],
    schema: {
      example: [{
        id: 1,
        title: "Inception",
        genre: "Sci-Fi",
        duration: 148,
        rating: 8.8,
        releaseYear: 2010
      }]
    }
  })
  async findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiBody({ 
    type: CreateMovieDto,
    schema: {
      example: {
        title: "Inception",
        genre: "Sci-Fi",
        duration: 148,
        rating: 8.8,
        releaseYear: 2010
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The movie has been successfully created',
    type: Movie
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Movie with this title already exists'
  })
  async create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @Put(':movieTitle')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a movie by title' })
  @ApiParam({ 
    name: 'movieTitle', 
    description: 'Title of the movie to update',
    example: 'Inception'
  })
  @ApiBody({ 
    type: CreateMovieDto,
    schema: {
      example: {
        title: "Inception",
        genre: "Sci-Fi",
        duration: 148,
        rating: 8.9,
        releaseYear: 2010
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The movie has been successfully updated',
    schema: {
      example: {
        message: 'Movie updated successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Movie not found'
  })
  async update(
    @Param('movieTitle') movieTitle: string,
    @Body() updateMovieDto: CreateMovieDto,
  ): Promise<{ message: string }> {
    await this.moviesService.update(movieTitle, updateMovieDto);
    return { message: 'Movie updated successfully' };
  }

  @Delete(':movieTitle')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a movie by title' })
  @ApiParam({ 
    name: 'movieTitle', 
    description: 'Title of the movie to delete',
    example: 'Inception'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The movie has been successfully deleted',
    schema: {
      example: {
        message: 'Movie deleted successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Movie not found'
  })
  async delete(@Param('movieTitle') movieTitle: string): Promise<{ message: string }> {
    await this.moviesService.delete(movieTitle);
    return { message: 'Movie deleted successfully' };
  }

  @Delete('id/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a movie by ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID of the movie to delete',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The movie has been successfully deleted',
    schema: {
      example: {
        message: 'Movie deleted successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Movie not found'
  })
  async deleteById(@Param('id') id: number): Promise<{ message: string }> {
    await this.moviesService.deleteById(id);
    return { message: 'Movie deleted successfully' };
  }
} 