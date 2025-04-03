import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { MoviesService } from '../movies/movies.service';

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectRepository(Showtime)
    private showtimesRepository: Repository<Showtime>,
    private moviesService: MoviesService,
  ) {}

  async findById(id: number): Promise<Showtime> {
    const showtime = await this.showtimesRepository.findOne({ 
      where: { id },
      relations: ['movie'],
    });
    
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID "${id}" not found`);
    }
    return showtime;
  }

  async findByMovieId(movieId: number): Promise<Showtime[]> {
    return this.showtimesRepository.find({
      where: { movieId },
      relations: ['movie'],
      order: {
        startTime: 'ASC'
      }
    });
  }

  async create(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
    // Validate movie exists
    const movie = await this.moviesService.findById(createShowtimeDto.movieId);
    
    // Validate start time before end time
    const startTime = new Date(createShowtimeDto.startTime);
    const endTime = new Date(createShowtimeDto.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new BadRequestException('Invalid date format for start time or end time');
    }
    
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }
    
    // Check for overlapping showtimes in the same theater
    const overlappingShowtime = await this.showtimesRepository.findOne({
      where: [
        {
          theater: createShowtimeDto.theater,
          startTime: LessThanOrEqual(endTime),
          endTime: MoreThanOrEqual(startTime),
        },
      ],
    });
    
    if (overlappingShowtime) {
      throw new ConflictException('There is already a showtime scheduled for this theater at the specified time');
    }
    
    const showtime = this.showtimesRepository.create({
      ...createShowtimeDto,
      startTime,
      endTime,
    });
    
    return await this.showtimesRepository.save(showtime);
  }

  async update(id: number, updateShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
    const showtime = await this.findById(id);
    
    // Validate movie exists if provided
    await this.moviesService.findById(updateShowtimeDto.movieId);
    
    // Validate start time before end time
    const startTime = new Date(updateShowtimeDto.startTime);
    const endTime = new Date(updateShowtimeDto.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new BadRequestException('Invalid date format for start time or end time');
    }
    
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }
    
    // Check for overlapping showtimes in the same theater (excluding this showtime)
    const overlappingShowtime = await this.showtimesRepository.findOne({
      where: [
        {
          id: Not(id),
          theater: updateShowtimeDto.theater,
          startTime: LessThanOrEqual(endTime),
          endTime: MoreThanOrEqual(startTime),
        },
      ],
    });
    
    if (overlappingShowtime) {
      throw new ConflictException('There is already a showtime scheduled for this theater at the specified time');
    }
    
    await this.showtimesRepository.update(id, {
      ...updateShowtimeDto,
      startTime,
      endTime,
    });

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const showtime = await this.findById(id);
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID "${id}" not found`);
    }
    const result = await this.showtimesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Showtime with ID "${id}" not found`);
    }
  }
} 