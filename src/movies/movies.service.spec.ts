import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: Repository<Movie>;

  const mockMovie = {
    id: 1,
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: 148,
    rating: 8.8,
    releaseYear: 2010,
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      mockRepository.find.mockResolvedValue([mockMovie]);
      const result = await service.findAll();
      expect(result).toEqual([mockMovie]);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return an empty array if no movies exist', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a movie by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMovie);
      const result = await service.findById(1);
      expect(result).toEqual(mockMovie);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createMovieDto: CreateMovieDto = {
      title: 'Inception',
      genre: 'Sci-Fi',
      duration: 148,
      rating: 8.8,
      releaseYear: 2010,
    };

    it('should create a new movie', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockMovie);
      mockRepository.save.mockResolvedValue(mockMovie);

      const result = await service.create(createMovieDto);
      expect(result).toEqual(mockMovie);
      expect(mockRepository.create).toHaveBeenCalledWith(createMovieDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockMovie);
    });

    it('should throw ConflictException if movie with same title exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockMovie);
      await expect(service.create(createMovieDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateMovieDto: CreateMovieDto = {
      title: 'Inception',
      genre: 'Sci-Fi',
      duration: 150,
      rating: 8.9,
      releaseYear: 2010,
    };

    it('should update a movie', async () => {
      mockRepository.findOne.mockResolvedValue(mockMovie);
      mockRepository.save.mockResolvedValue({ ...mockMovie, ...updateMovieDto });

      const result = await service.update('Inception', updateMovieDto);
      expect(result).toEqual({ ...mockMovie, ...updateMovieDto });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update('NonExistent', updateMovieDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a movie by title', async () => {
      mockRepository.findOne.mockResolvedValue(mockMovie);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('Inception');
      expect(mockRepository.delete).toHaveBeenCalledWith({ title: 'Inception' });
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.delete('NonExistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteById', () => {
    it('should delete a movie by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMovie);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteById(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteById(999)).rejects.toThrow(NotFoundException);
    });
  });
}); 