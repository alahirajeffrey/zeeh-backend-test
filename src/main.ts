import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './common';
import { AppModule } from './modules';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // setup global http exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // setup validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  // setup cors
  app.enableCors();

  // setup swagger
  const config = new DocumentBuilder()
    .setTitle('Zeeh API')
    .setDescription('Zeeh API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/doc', app, document);

  await app.listen(Number(process.env.NODE_PORT) || 3000);
}
bootstrap();
