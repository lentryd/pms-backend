import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export default class BaseUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

export class CreateUserDto extends BaseUserDto {}
export class UpdateUserDto extends PartialType(
  OmitType(BaseUserDto, ['password']),
) {
  @IsString()
  @MinLength(8)
  @IsOptional()
  readonly new_password?: string;

  @IsString()
  @IsOptional()
  readonly current_password?: string;
}
