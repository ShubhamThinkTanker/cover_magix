import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Categories } from './categories.schema';
import { EnsureAdminAuthenticatedMiddleware } from '../../../Helper/middleware';
import { Admin } from '../auth/auth.schema';
import { Sub_Categories } from '../sub_categories/sub_categories.schema';
import { Products } from '../product/product.schema';
import { S3Service } from 'Helper/S3Bucket';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogger } from 'Helper/activityLogger';
import { ActivityLogService } from '../activity_log/activity_log.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Categories, Sub_Categories, Products, Admin,ActivityLog]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService,S3Service, ActivityLogger, ActivityLogService],
})
export class CategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAdminAuthenticatedMiddleware)
      .exclude(
          { path: 'categories/list_V_L_All_categories', method: RequestMethod.GET },
          { path: 'categories/list_V_L_Products', method: RequestMethod.POST },
          { path: 'categories/list_V_L_subcategory', method: RequestMethod.POST },
          { path: 'categories/list_V_L_categories_Products', method: RequestMethod.POST },
          { path: 'categories/Listing-menu-user', method: RequestMethod.GET }

      )
      .forRoutes(CategoriesController);
  }
}
