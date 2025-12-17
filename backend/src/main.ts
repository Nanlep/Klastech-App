import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Global Config
  app.enableCors({
    origin: ['https://klastech.pro', 'http://localhost:3000'], // Allow Frontend
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 2. API Documentation (Swagger)
  const config = new DocumentBuilder()
    .setTitle('Klastech API')
    .setDescription('Enterprise Financial Infrastructure API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 3. Start Server
  await app.listen(process.env.PORT || 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();