import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.setGlobalPrefix('api/v1');

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  const uploadDir = process.env.UPLOAD_ROOT || join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });

  // Parse comma-separated ALLOWED_ORIGINS from environment variable
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const frontendUrl = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');

  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server, curl, mobile apps, or same-origin requests without Origin header
      if (!origin) {
        return callback(null, true);
      }

      // Allow local development (localhost and 127.0.0.1 on any port)
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel production and preview deployment domain
      if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Allow explicit origins in ALLOWED_ORIGINS
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow FRONTEND_URL if specified
      if (frontendUrl && origin === frontendUrl) {
        return callback(null, true);
      }

      // Permissive fallback for demo environments
      callback(null, true);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
