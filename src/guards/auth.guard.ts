import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Return true if the route is public
    if (isPublic) {
      return true;
    }

    // Get the request object from the context
    const request = context.switchToHttp().getRequest();
    // Extract the token from the Authorization header
    const token = this.extractTokenFromHeader(request);
    // Throw an error if the token is missing
    if (!token) throw new UnauthorizedException('Missing token');

    try {
      // Validate the token and get the user ID
      const userId = await this.validateToken(token);
      // Validate the user and set the user object on the request
      request.user = await this.validateUser(userId);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    // Return true to allow the request to proceed
    return true;
  }

  // Validate the user and return the user object without the password
  private async validateUser(userId: string) {
    // Find the user by ID and select only the ID, email, and name fields
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    // Throw an error if the user is not found
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Return the user object without the password
    return user;
  }

  // Validate the token and return the user ID
  private async validateToken(token: string) {
    try {
      // Get the payload from the token using the JWT service
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      // Check if the payload is an object and contains a 'sub' property
      if (typeof payload !== 'object' || !('sub' in payload)) {
        throw new UnauthorizedException('Invalid token');
      }

      // Return the user ID from the 'sub' property of the payload
      return payload.sub;
    } catch {
      // Throw an error if the token is invalid or expired
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Extract the token from the Authorization header
  private extractTokenFromHeader(request: Request): string | undefined {
    // Split the Authorization header into the type and token
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    // Return the token if the type is 'Bearer', otherwise return undefined
    return type === 'Bearer' ? token : undefined;
  }
}
