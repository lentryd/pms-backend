import { Body, Post, Controller } from '@nestjs/common';
import LoginDto from './auth.dto';
import { CreateUserDto } from '../users/users.dto';
import { AuthService } from './auth.service';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

class LoginResponse {
  @ApiProperty({
    description: 'The access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    type: 'string',
  })
  access_token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: 200,
    description: 'The user has successfully logged in',
    type: LoginResponse,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({
    status: 200,
    description: 'The user has successfully registered',
    type: LoginResponse,
  })
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }
}
