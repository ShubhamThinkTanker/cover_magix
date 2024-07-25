// import { Module } from '@nestjs/common';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AirBagsController } from './air_bags.controller';
import {  AirBagsService } from './air_bags.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Air_bags } from './air_bags.schema';
import { EnsureAdminAuthenticatedMiddleware } from '../../../Helper/middleware'
import { Admin } from '../auth/auth.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
    imports: [
        SequelizeModule.forFeature([Air_bags , Admin, ActivityLog]),
      ],
    
      controllers: [AirBagsController],
      providers: [AirBagsService , ActivityLogService, ActivityLogger],
})
export class AirBagsModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(EnsureAdminAuthenticatedMiddleware)
          .forRoutes(AirBagsController);    
      }
}
