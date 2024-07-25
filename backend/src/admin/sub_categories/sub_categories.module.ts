import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sub_Categories } from './sub_categories.schema';
import { Products } from '../product/product.schema';
import { Admin } from '../auth/auth.schema';
import { S3Service } from '../../../Helper/S3Bucket';
import { SubCategoriesController } from './sub_categories.controller';
import { SubCategoriesService } from './sub_categories.service';
import { EnsureAdminAuthenticatedMiddleware } from '../../../Helper/middleware';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
  imports: [
    SequelizeModule.forFeature([Sub_Categories, Products, Admin, ActivityLog]),
  ],

  controllers: [SubCategoriesController],
  providers: [SubCategoriesService,S3Service, ActivityLogService, ActivityLogger],
})

export class SubCategoriesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAdminAuthenticatedMiddleware)
      .exclude(
        { path: 'sub-categories/list_V_L_SubCategory_Products', method: RequestMethod.POST },
      )
      .forRoutes(SubCategoriesController);
  }
}
