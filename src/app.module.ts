import { join } from 'path';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { ServeStaticModule } from '@nestjs/serve-static';

const staticModule = process.env.CLIENT_DIR
  ? [
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', process.env.CLIENT_DIR),
        exclude: ['/api/(.*)'],
      }),
    ]
  : [];

@Module({
  imports: [
    AuthModule,
    UsersModule,
    EventsModule,
    PrismaModule,
    ProjectsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ...staticModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
