import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import BaseUserDto, { UpdateUserDto } from './users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'The found records',
    type: [BaseUserDto],
  })
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: BaseUserDto,
  })
  findOne(@Param('id') id: string, @Request() req) {
    if (id === 'me') {
      return req.user;
    } else {
      return this.users.findOne(id);
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a user by id' })
  @ApiResponse({
    status: 200,
    description: 'The updated record',
    type: BaseUserDto,
  })
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
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiResponse({
    status: 200,
    description: 'The deleted record',
  })
  delete(@Param('id') id: string, @Request() req) {
    id = id === 'me' ? req.user.id : id;
    if (id !== req.user.id) {
      throw new BadRequestException('You can only delete your own user');
    }
    return this.users.delete(id);
  }
}
