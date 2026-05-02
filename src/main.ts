import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,            // elimina propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // opcional: lanza error si mandan campos extra
  }))

  await app.listen(process.env.PORT ?? 3000);
  console.log("APP CORRIENDO EN EL PURTO: " + 3000)
}
bootstrap();
