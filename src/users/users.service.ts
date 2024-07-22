import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './users.dto';

type UserUpdateData = UpdateUserDto & { password?: string };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all users
   * @returns all users
   */
  async findAll() {
    return (await this.prisma.user.findMany()).map(
      ({ password, ...user }) => user,
    );
  }

  /**
   * Find a user by id
   * @param id id of the user
   * @returns the user
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Update a user
   * @param id id of the user
   * @param dto user data
   * @returns the updated user
   */
  async update(id: string, dto: UpdateUserDto) {
    const { current_password, new_password, ...data }: UserUpdateData = dto;
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if the email is already in use
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Email is already in use');
      }
    }

    // Update the password if a new password is provided
    if (new_password) {
      if (!current_password) {
        throw new BadRequestException(
          'Current password is required to update the password',
        );
      }

      const passwordMatches = await bcrypt.compare(
        current_password,
        user.password,
      );
      if (!passwordMatches) {
        throw new BadRequestException('Current password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      data.password = hashedPassword;
    }

    // Update the user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  /**
   * Delete a user
   * @param id id of the user
   * @returns empty object
   */
  async delete(id: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Delete the user
    await this.prisma.user.delete({ where: { id } });
    return;
  }
}
