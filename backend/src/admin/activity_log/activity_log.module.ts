import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EnsureAdminAuthenticatedMiddleware } from 'Helper/middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from '../auth/auth.schema';
import { ActivityLogService } from './activity_log.service';
import { ActivityLogController } from './activity_log.controller';
import { ActivityLog } from './activity_log.schema';


@Module({
  imports: [
    SequelizeModule.forFeature([ActivityLog , Admin]), 
  ],
  providers: [ActivityLogService],
  controllers: [ActivityLogController]
})
export class ActivityLogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAdminAuthenticatedMiddleware)
      .forRoutes(ActivityLogController);    
  }
}

