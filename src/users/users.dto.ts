import { OmitType, PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export default class BaseUserDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user identifier',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user name',
    example: 'John Doe',
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user email',
    example: 'me@gmail.com',
  })
  email: string;
}

export class CreateUserDto extends OmitType(BaseUserDto, ['id']) {
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user password',
    example: '12345678',
  })
  password: string;
}
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password']),
) {
  @IsString()
  @MinLength(8)
  @IsOptional()
  @ApiProperty({
    description: 'The user new password',
    example: '12345678',
    required: false,
  })
  readonly new_password?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The user current password',
    example: '12345678',
    required: false,
  })
  readonly current_password?: string;
}
