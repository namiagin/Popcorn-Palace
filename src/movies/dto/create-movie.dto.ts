import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  genre: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1900)
  releaseYear: number;
} 