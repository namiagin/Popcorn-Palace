import { Controller, Post, Body } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiBody({ 
    type: CreateBookingDto,
    schema: {
      example: {
        showtimeId: 1,
        seatNumber: 15,
        userId: "84438967-f68f-4fa0-b620-0f08217e76af"
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The booking has been successfully created',
    schema: {
      example: {
        bookingId: "d1a6423b-4469-4b00-8c5f-e3cfc42eacae",
        seatNumber: 15
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Showtime not found'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Seat is already booked for this showtime'
  })
  async create(@Body() createBookingDto: CreateBookingDto): Promise<{ bookingId: string; seatNumber: number }> {
    return this.bookingsService.create(createBookingDto);
  }
} 