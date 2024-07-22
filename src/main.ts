import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function setupSwagger(app) {
  const config = new DocumentBuilder()
    .setTitle('Project management system API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

async function start() {
  // Create the app
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());
  // Set global prefix for API (if CLIENT_DIR is set)
  if (process.env.CLIENT_DIR) app.setGlobalPrefix('api');

  // Swagger setup (if development mode)
  if (process.env.NODE_ENV === 'development') setupSwagger(app);

  // Start the app
  await app.listen(process.env.PORT || 3000);
}
start();
