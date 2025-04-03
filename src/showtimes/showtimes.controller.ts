import { Controller, Get, Post, Body, Param, Delete, HttpCode, Put, ParseIntPipe } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { Showtime } from './entities/showtime.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('showtimes')
@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Get(':showtimeId')
  @ApiOperation({ summary: 'Get a showtime by ID' })
  @ApiParam({ 
    name: 'showtimeId', 
    description: 'ID of the showtime to retrieve',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the showtime details',
    type: Showtime,
    schema: {
      example: {
        id: 1,
        movieId: 1,
        theater: "Theater 1",
        startTime: "2024-03-30T18:00:00Z",
        endTime: "2024-03-30T20:28:00Z",
        price: 12.99
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Showtime not found'
  })
  async findById(@Param('showtimeId', ParseIntPipe) id: number): Promise<Showtime> {
    return this.showtimesService.findById(id);
  }

  @Get('movie/:movieId')
  @ApiOperation({ summary: 'Get all showtimes for a movie' })
  @ApiParam({ 
    name: 'movieId', 
    description: 'ID of the movie to get showtimes for',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns an array of showtimes for the specified movie',
    type: [Showtime],
    schema: {
      example: [{
        id: 1,
        movieId: 1,
        theater: "Theater 1",
        startTime: "2024-03-30T18:00:00Z",
        endTime: "2024-03-30T20:28:00Z",
        price: 12.99
      }]
    }
  })
  async findByMovieId(@Param('movieId', ParseIntPipe) movieId: number): Promise<Showtime[]> {
    return this.showtimesService.findByMovieId(movieId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new showtime' })
  @ApiBody({ 
    type: CreateShowtimeDto,
    schema: {
      example: {
        movieId: 1,
        theater: "Theater 1",
        startTime: "2024-03-30T18:00:00Z",
        endTime: "2024-03-30T20:28:00Z",
        price: 12.99
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The showtime has been successfully created',
    type: Showtime
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Movie not found'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Showtime overlaps with existing showtime in the same theater'
  })
  async create(@Body() createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
    return this.showtimesService.create(createShowtimeDto);
  }

  @Put(':showtimeId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a showtime by ID' })
  @ApiParam({ 
    name: 'showtimeId', 
    description: 'ID of the showtime to update',
    example: 1
  })
  @ApiBody({ 
    type: CreateShowtimeDto,
    schema: {
      example: {
        movieId: 1,
        theater: "Theater 1",
        startTime: "2024-03-30T18:00:00Z",
        endTime: "2024-03-30T20:28:00Z",
        price: 13.99
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The showtime has been successfully updated',
    type: Showtime
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Showtime not found'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Showtime overlaps with existing showtime in the same theater'
  })
  async update(
    @Param('showtimeId', ParseIntPipe) id: number,
    @Body() updateShowtimeDto: CreateShowtimeDto,
  ): Promise<Showtime> {
    await this.showtimesService.update(id, updateShowtimeDto);
    return this.showtimesService.findById(id);
  }

  @Delete(':showtimeId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a showtime by ID' })
  @ApiParam({ 
    name: 'showtimeId', 
    description: 'ID of the showtime to delete',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The showtime has been successfully deleted',
    schema: {
      example: {
        message: 'Showtime deleted successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Showtime not found'
  })
  async delete(@Param('showtimeId', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.showtimesService.delete(id);
    return { message: 'Showtime deleted successfully' };
  }
} 