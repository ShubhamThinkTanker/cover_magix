import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from '../auth/auth.schema';
import { EnsureAdminAuthenticatedMiddleware } from '../../../Helper/middleware';
import { Tie_Down } from './tie_downs.schema';
import { S3Service } from 'Helper/S3Bucket';
import { TieDownsController } from './tie_downs.controller';
import { TieDownsService } from './tie_downs.service';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
    imports: [
      SequelizeModule.forFeature([Tie_Down , Admin, ActivityLog]), 
      
    ],
  
    controllers: [TieDownsController],
    providers: [TieDownsService,S3Service,ActivityLogService,ActivityLogger],
  })

export class TieDownsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(EnsureAdminAuthenticatedMiddleware)
        .forRoutes(TieDownsController);    
    }
  }
