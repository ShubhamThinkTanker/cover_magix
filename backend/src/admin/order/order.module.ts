import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EnsureAdminAuthenticatedMiddleware } from 'Helper/middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from '../auth/auth.schema';
import { S3Service } from 'Helper/S3Bucket';
import { Orders } from './order.schema';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
  imports: [
    SequelizeModule.forFeature([Orders , Admin, ActivityLog]), 
    
  ],
  providers: [OrderService, ActivityLogService, ActivityLogger],
  controllers: [OrderController]
})
export class OrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAdminAuthenticatedMiddleware)
      .forRoutes(OrderController);    
  }
}

