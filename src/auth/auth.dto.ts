import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/users/users.dto';

export default class LoginDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {}
