import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function addSwagger<T>(app: INestApplication<T>, prefix: string) {
  const config = new DocumentBuilder()
    .setTitle('Todo example')
    .setDescription('REST API methods for TODO application')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(prefix, app, documentFactory);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  const swaggerPrefix = 'sw';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;

  addSwagger(app, swaggerPrefix);
  await app.listen(port);
  Logger.log(
    `😊 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `😎 Swagger is running on: http://localhost:${port}/${swaggerPrefix}`
  );
}

void bootstrap();
