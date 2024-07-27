import { Body, Post, Controller } from '@nestjs/common';
import LoginDto from './auth.dto';
import { CreateUserDto } from '../users/users.dto';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @Public()
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }
}
