import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

export default class BaseStageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The stage name',
    example: 'Stage 1',
  })
  name: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The stage description',
    example: 'This is the first stage',
    required: false,
  })
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The start date of the stage',
    example: '2021-01-01T00:00:00.000Z',
  })
  startDate: Date;
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The end date of the stage',
    example: '2021-01-02T00:00:00.000Z',
  })
  endDate: Date;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The project identifier',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;
}

export class CreateStageDto extends BaseStageDto {}
export class UpdateStageDto extends PartialType(
  OmitType(BaseStageDto, ['projectId']),
) {}
