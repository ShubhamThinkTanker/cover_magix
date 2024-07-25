import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FabricController } from './fabric.controller';
import { FabricService } from './fabric.service';
import { Admin } from '../auth/auth.schema';
import { EnsureAdminAuthenticatedMiddleware } from '../../../Helper/middleware';
import { Fabrics } from './fabric.schema';
import { FabricsMaterial } from './fabricMaterial.schema';
import { S3Service } from 'Helper/S3Bucket';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
@Module({
    imports: [
      SequelizeModule.forFeature([Fabrics ,FabricsMaterial, Admin, ActivityLog]), 
      
    ],
    controllers: [FabricController],
    providers: [FabricService,S3Service,ActivityLogService,ActivityLogger],
  })

export class FabricModule  implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(EnsureAdminAuthenticatedMiddleware)
        .forRoutes(FabricController);    
    }
  }

