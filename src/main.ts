import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './setup';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  await setupApp(app);

  const confiService = app.get(ConfigService);
  const port = confiService.get("PORT");
  
  await app.listen(port || 3000);
}

bootstrap();
