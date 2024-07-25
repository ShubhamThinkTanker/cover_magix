import { Module, MiddlewareConsumer } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CorsMiddleware } from 'Helper/cors.middleware';
import * as cors from 'cors';

import { ValidationPipe } from '@nestjs/common';
@Module({
  imports: [AppModule],
})
export class MainModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  // app.use(cors());
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }));
  // Set the global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // const globalPrefix = 'api/v1';
  // app.setGlobalPrefix(globalPrefix);

  // // Apply middleware to exclude prefix for specific routes
  // app.use((req, res, next) => {
  //   if (req.originalUrl.startsWith(`/${globalPrefix}/auth`)) {
  //     next();
  //   } else {
  //     req.url = `/${globalPrefix}${req.url}`;
  //     next();
  //   }
  // });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Star Cover')
    .setDescription('Star_Cover API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Use global validation pipe
  // This ensures that all incoming requests are validated
  // against the defined validation rules.
  // For trimming, set `whitelist` to `true`.
  // For detailed error messages, set `transform` to `true`.
  // For async validation, set `transformOptions` to `{ validateCustomDecorators: true }`.
  // For production, consider setting `disableErrorMessages` to `true`.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: false, // Set to true for production
    }),
  );

  await app.listen(5000);
}
bootstrap();
