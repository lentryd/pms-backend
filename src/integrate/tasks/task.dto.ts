import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export default class BaseTaskDto {
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

  @IsNumber()
  @IsNotEmpty()
  indexAtStage: number;
  @IsUUID()
  @IsNotEmpty()
  stageId: string;
  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}

export class CreateTaskDto extends BaseTaskDto {}
export class UpdateTaskDto extends PartialType(
  OmitType(BaseTaskDto, ['projectId']),
) {}
