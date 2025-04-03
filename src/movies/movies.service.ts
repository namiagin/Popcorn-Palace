import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
  ) {}

  async findAll(): Promise<Movie[]> {
    return this.moviesRepository.find();
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    // Check if movie with same title already exists
    const existingMovie = await this.moviesRepository.findOne({
      where: { title: createMovieDto.title },
    });

    if (existingMovie) {
      throw new ConflictException(`Movie with title "${createMovieDto.title}" already exists`);
    }

    const movie = this.moviesRepository.create(createMovieDto);
    return this.moviesRepository.save(movie);
  }

  async update(title: string, updateMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { title } });
    if (!movie) {
      throw new NotFoundException(`Movie with title "${title}" not found`);
    }

    // Check if the new title conflicts with an existing movie
    if (updateMovieDto.title !== title) {
      const existingMovie = await this.moviesRepository.findOne({
        where: { title: updateMovieDto.title },
      });
      if (existingMovie) {
        throw new ConflictException(`Movie with title "${updateMovieDto.title}" already exists`);
      }
    }

    Object.assign(movie, updateMovieDto);
    return this.moviesRepository.save(movie);
  }

  async delete(title: string): Promise<void> {
    const movie = await this.moviesRepository.findOne({ where: { title } });
    if (!movie) {
      throw new NotFoundException(`Movie with title "${title}" not found`);
    }
    await this.moviesRepository.delete({ title });
  }

  async findById(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID "${id}" not found`);
    }
    return movie;
  }

  async deleteById(id: number): Promise<void> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID "${id}" not found`);
    }
    await this.moviesRepository.delete(id);
  }
} 