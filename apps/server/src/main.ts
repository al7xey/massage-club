import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, static as serveStatic, type NextFunction, type Request, type Response, urlencoded } from 'express';
import path from 'node:path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isSensitiveRuntime = nodeEnv === 'production' || nodeEnv === 'docker';
  const allowedOrigins = resolveCorsOrigins(configService.get<string>('CORS_ORIGIN'), nodeEnv);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.setGlobalPrefix(apiPrefix);
  app.use('/uploads', serveStatic(path.resolve(process.cwd(), 'uploads')));
  app.use(json({ limit: '256kb' }));
  app.use(urlencoded({ extended: true, limit: '256kb' }));
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
  });
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin "${origin}" is not allowed by CORS`), false);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(!isSensitiveRuntime));

  if (!isSensitiveRuntime) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Massage Subscription API')
      .setDescription('REST API for massage subscriptions, booking, certificates and administration.')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  const port = configService.get<number>('SERVER_PORT', 3000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();

function resolveCorsOrigins(configValue?: string, nodeEnv = 'development') {
  const defaultOrigins =
    nodeEnv === 'production' || nodeEnv === 'docker'
      ? []
      : [
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5175',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174',
          'http://127.0.0.1:5175',
          'http://[::1]:5173',
          'http://[::1]:5174',
          'http://[::1]:5175',
        ];
  const configuredOrigins = (configValue ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...defaultOrigins, ...configuredOrigins]));
}
