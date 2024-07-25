import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { EnsureAdminAuthenticatedMiddleware } from 'Helper/middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from '../auth/auth.schema';
import { Rating } from './rating.schema';
import { S3Service } from 'Helper/S3Bucket';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
  imports: [
    SequelizeModule.forFeature([Rating , Admin, ActivityLog]), 
    
  ],
  providers: [RatingService,S3Service, ActivityLogService, ActivityLogger],
  controllers: [RatingController]
})
export class RatingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAdminAuthenticatedMiddleware)
      .forRoutes(RatingController);    
  }
}

