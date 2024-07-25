// import { Module } from '@nestjs/common';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ZipperController } from './zipper.controller';
import {  ZipperService } from './zipper.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Zipper } from './zipper.schema';
import { EnsureAdminAuthenticatedMiddleware } from '../../../Helper/middleware'
import { Admin } from '../auth/auth.schema';
import { S3Service } from 'Helper/S3Bucket';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
    imports: [
        SequelizeModule.forFeature([Zipper , Admin, ActivityLog]), 
      ],
    
      controllers: [ZipperController],
      providers: [ZipperService, S3Service, ActivityLogService, ActivityLogger],
})
export class ZipperModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(EnsureAdminAuthenticatedMiddleware)
          .forRoutes(ZipperController);    
      }
}
