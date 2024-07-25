import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DeckTypeController } from './deck_type.controller';
import { DeckTypeService } from './deck_type.service';
import { Admin } from '../auth/auth.schema';
import { DeckType } from './deck_type.schema';
import { S3Service } from 'Helper/S3Bucket';
import { EnsureAdminAuthenticatedMiddleware } from '../../../Helper/middleware';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
    imports: [
        SequelizeModule.forFeature([DeckType, Admin, ActivityLog]), 
      ],
      controllers: [DeckTypeController],
      providers: [DeckTypeService,S3Service,ActivityLogService,ActivityLogger],
})


export class DeckTypeModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(EnsureAdminAuthenticatedMiddleware)
          .forRoutes(DeckTypeController);    
      }
}
