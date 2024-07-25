import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
// import { Sub_Categories } from './sub_categories.schema';
import { GrommetsController } from './grommets.controller';
import { GrommetsService } from './grommets.service';
import { Admin } from '../auth/auth.schema';
import { EnsureAdminAuthenticatedMiddleware } from '../../../Helper/middleware';
import { Grommets } from './grommets.schema';
import { S3Service } from 'Helper/S3Bucket';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
    imports: [
      SequelizeModule.forFeature([Grommets , Admin, ActivityLog]), 
      
    ],
  
    controllers: [GrommetsController],
    providers: [GrommetsService,S3Service,ActivityLogService,ActivityLogger],
  })
  
export class GrommetsModule  implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(EnsureAdminAuthenticatedMiddleware)
        .forRoutes(GrommetsController);    
    }
  }
