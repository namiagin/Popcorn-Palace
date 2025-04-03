import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ShowtimesService } from '../showtimes/showtimes.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let repository: Repository<Booking>;
  let showtimesService: ShowtimesService;

  const mockShowtime = {
    id: 1,
    movieId: 1,
    theater: 'Theater 1',
    startTime: new Date('2024-03-30T18:00:00Z'),
    endTime: new Date('2024-03-30T20:28:00Z'),
    price: 12.99,
  };

  const mockBooking = {
    bookingId: 'd1a6423b-4469-4b00-8c5f-e3cfc42eacae',
    showtimeId: 1,
    seatNumber: 15,
    userId: '84438967-f68f-4fa0-b620-0f08217e76af',
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockShowtimesService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
        {
          provide: ShowtimesService,
          useValue: mockShowtimesService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    repository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    showtimesService = module.get<ShowtimesService>(ShowtimesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createBookingDto: CreateBookingDto = {
      showtimeId: 1,
      seatNumber: 15,
      userId: '84438967-f68f-4fa0-b620-0f08217e76af',
    };

    it('should create a new booking', async () => {
      mockShowtimesService.findById.mockResolvedValue(mockShowtime);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockBooking);
      mockRepository.save.mockResolvedValue(mockBooking);

      const result = await service.create(createBookingDto);
      expect(result).toEqual({
        bookingId: mockBooking.bookingId,
        seatNumber: mockBooking.seatNumber,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createBookingDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockBooking);
    });

    it('should throw NotFoundException if showtime not found', async () => {
      mockShowtimesService.findById.mockRejectedValue(new NotFoundException());
      await expect(service.create(createBookingDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if seat is already booked', async () => {
      mockShowtimesService.findById.mockResolvedValue(mockShowtime);
      mockRepository.findOne.mockResolvedValue(mockBooking);
      await expect(service.create(createBookingDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid seat number', async () => {
      const invalidDto = {
        ...createBookingDto,
        seatNumber: 0,
      };
      await expect(service.create(invalidDto)).rejects.toThrow();
    });
  });
}); 