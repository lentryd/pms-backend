import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IS_MEMBER_KEY, IS_OWNER_KEY } from '../decorators/member.decorator';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is owner only
    const isOwner = this.reflector.getAllAndOverride<boolean>(IS_OWNER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Check if the route is member only
    const isMember = this.reflector.getAllAndOverride<boolean>(IS_MEMBER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Check if the route is general access
    const isGeneral = !isOwner && !isMember;

    // If the route is general access, return true
    if (isGeneral) {
      return true;
    }

    // Get the request object from the context
    const request = context.switchToHttp().getRequest();
    // Extract the project ID from the request parameters
    const projectId = request.params.id;
    // Extract the user ID from the request
    const userId = request.user.id;

    // Check if the user is a member of the project
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
        OR: isOwner
          ? [{ ownerId: userId }]
          : [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
    });

    // Throw an error if the user is not a member of the project
    if (!project) {
      throw new ForbiddenException(
        isOwner
          ? 'You are not the owner of this project'
          : 'You are not a member of this project',
      );
    }

    // Return true if the user is a member of the project
    return true;
  }
}
