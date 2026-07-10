import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // elimina cualquier propiedad que NO esté en el DTO (seguridad extra)
    forbidNonWhitelisted: true, // si mandan un campo de más, rechaza la petición con error
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();