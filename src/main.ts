import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function start() {
  // Create the app
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());
  // Set global prefix for API (if CLIENT_DIR is set)
  if (process.env.CLIENT_DIR) app.setGlobalPrefix('api');

  // Start the app
  await app.listen(process.env.PORT || 3000);
}
start();
