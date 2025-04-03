import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { ShowtimesService } from './showtimes.service';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { MoviesService } from '../movies/movies.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('ShowtimesService', () => {
  let service: ShowtimesService;
  let repository: Repository<Showtime>;
  let moviesService: MoviesService;

  const mockMovie = {
    id: 1,
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: 148,
    rating: 8.8,
    releaseYear: 2010,
  };

  const mockShowtime = {
    id: 1,
    movieId: 1,
    theater: 'Theater 1',
    startTime: new Date('2024-03-30T18:00:00Z'),
    endTime: new Date('2024-03-30T20:28:00Z'),
    price: 12.99,
  };

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMoviesService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        {
          provide: getRepositoryToken(Showtime),
          useValue: mockRepository,
        },
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    service = module.get<ShowtimesService>(ShowtimesService);
    repository = module.get<Repository<Showtime>>(getRepositoryToken(Showtime));
    moviesService = module.get<MoviesService>(MoviesService);

    // Reset all mocks before each test
    jest.clearAllMocks();
    mockMoviesService.findById.mockResolvedValue(mockMovie);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a showtime by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockShowtime);
      const result = await service.findById(1);
      expect(result).toEqual(mockShowtime);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ 
        where: { id: 1 },
        relations: ['movie'],
      });
    });

    it('should throw NotFoundException if showtime not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByMovieId', () => {
    it('should return showtimes for a movie', async () => {
      mockRepository.find.mockResolvedValue([mockShowtime]);
      const result = await service.findByMovieId(1);
      expect(result).toEqual([mockShowtime]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { movieId: 1 },
        relations: ['movie'],
        order: { startTime: 'ASC' },
      });
    });

    it('should return empty array if no showtimes exist', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.findByMovieId(1);
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    const createShowtimeDto: CreateShowtimeDto = {
      movieId: 1,
      theater: 'Theater 1',
      startTime: '2024-03-30T18:00:00Z',
      endTime: '2024-03-30T20:28:00Z',
      price: 12.99,
    };

    it('should create a new showtime', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockShowtime);
      mockRepository.save.mockResolvedValue(mockShowtime);

      const result = await service.create(createShowtimeDto);
      expect(result).toEqual(mockShowtime);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createShowtimeDto,
        startTime: new Date(createShowtimeDto.startTime),
        endTime: new Date(createShowtimeDto.endTime),
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMoviesService.findById.mockRejectedValue(new NotFoundException());
      await expect(service.create(createShowtimeDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid date format', async () => {
      const invalidDto = {
        ...createShowtimeDto,
        startTime: 'invalid-date',
      };
      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if start time is after end time', async () => {
      const invalidDto = {
        ...createShowtimeDto,
        startTime: '2024-03-30T20:00:00Z',
        endTime: '2024-03-30T18:00:00Z',
      };
      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for overlapping showtimes', async () => {
      mockRepository.findOne.mockResolvedValue(mockShowtime);
      await expect(service.create(createShowtimeDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateShowtimeDto: CreateShowtimeDto = {
      movieId: 1,
      theater: 'Theater 1',
      startTime: '2024-03-30T18:00:00Z',
      endTime: '2024-03-30T20:28:00Z',
      price: 13.99,
    };

    it('should update a showtime', async () => {
      mockRepository.findOne.mockResolvedValue(mockShowtime);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(mockShowtime).mockResolvedValueOnce(null);

      const result = await service.update(1, updateShowtimeDto);
      expect(result).toEqual(mockShowtime);
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        ...updateShowtimeDto,
        startTime: new Date(updateShowtimeDto.startTime),
        endTime: new Date(updateShowtimeDto.endTime),
      });
    });

    it('should throw NotFoundException if showtime not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, updateShowtimeDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for overlapping showtimes', async () => {
      mockRepository.findOne.mockResolvedValue(mockShowtime);
      mockRepository.findOne.mockResolvedValueOnce(mockShowtime).mockResolvedValueOnce(mockShowtime);

      await expect(service.update(1, updateShowtimeDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete a showtime', async () => {
      mockRepository.findOne.mockResolvedValue(mockShowtime);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if showtime not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
}); 