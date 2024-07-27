import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export default class BaseStageDto {
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
  projectId: string;
}

export class CreateStageDto extends BaseStageDto {}
export class UpdateStageDto extends PartialType(
  OmitType(BaseStageDto, ['projectId']),
) {}
