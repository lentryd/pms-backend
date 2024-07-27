import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    if (id === 'me') {
      return req.user;
    } else {
      return this.users.findOne(id);
    }
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateUserDto,
  ) {
    id = id === 'me' ? req.user.id : id;
    if (id !== req.user.id) {
      throw new BadRequestException('You can only update your own user');
    }
    return this.users.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    id = id === 'me' ? req.user.id : id;
    if (id !== req.user.id) {
      throw new BadRequestException('You can only delete your own user');
    }
    return this.users.delete(id);
  }
}
