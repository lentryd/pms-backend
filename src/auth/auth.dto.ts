import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/users.dto';

export default class LoginDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {}
