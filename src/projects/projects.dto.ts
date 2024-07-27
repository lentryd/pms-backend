import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export default class BaseProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string;
}

export class CreateProjectDto extends BaseProjectDto {}

export class UpdateProjectDto extends PartialType(
  OmitType(BaseProjectDto, ['ownerId']),
) {}
