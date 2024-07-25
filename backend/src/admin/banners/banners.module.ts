import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { EnsureAdminAuthenticatedMiddleware } from 'Helper/middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from '../auth/auth.schema';
import { Banners } from './banners.schema';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { S3Service } from 'Helper/S3Bucket';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
  imports: [
    SequelizeModule.forFeature([Banners , Admin, ActivityLog]), 
    
  ],
  providers: [BannersService, S3Service, ActivityLogService , ActivityLogger],
  controllers: [BannersController]
})
export class BannersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAdminAuthenticatedMiddleware)
      .exclude(
        { path: 'banners/first_banner', method: RequestMethod.GET },
        { path: 'banners/second_banner', method: RequestMethod.GET } ,
        { path: 'banners/third_banner', method: RequestMethod.GET } 

      )
      .forRoutes(BannersController);    
  }
}

