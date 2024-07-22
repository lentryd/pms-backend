import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import BaseUserDto from '../users/users.dto';

export default class BaseProjectDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'uuid',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The project name',
    example: 'Project 1',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The project description',
    example: 'This is a project',
  })
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The project start date',
    example: '2021-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The project end date',
    example: '2021-01-02T00:00:00.000Z',
  })
  endDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The project creation date',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The project update date',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The project owner ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  ownerId: string;

  owner: BaseUserDto;
}

export class CreateProjectDto extends OmitType(BaseProjectDto, [
  'id',
  'createdAt',
  'updatedAt',
  'ownerId',
  'owner',
]) {}

export class UpdateProjectDto extends PartialType(
  OmitType(BaseProjectDto, [
    'id',
    'createdAt',
    'updatedAt',
    'ownerId',
    'owner',
  ]),
) {}

export class AddMemberDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user ID to add to the project',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}
