import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Products } from './product.schema';
import { ProductsImage } from './productImage.schema';
import { Admin } from '../auth/auth.schema';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { EnsureAdminAuthenticatedMiddleware } from '../../../Helper/middleware';
import { S3Service } from 'Helper/S3Bucket';
import { ProductsFeatures } from './productFeatures.schema';
import { Tie_Down } from '../tie_downs/tie_downs.schema';
import { Grommets } from '../grommets/grommets.schema';
import { Air_bags } from '../air_bags/air_bags.schema';
import { FabricsMaterial } from '../fabric/fabricMaterial.schema';
import { ProductsFeaturesMaster } from './productFeatureMaster.schema';
import { ProductsMeasurement } from './product_measurement.schema ';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
@Module({
  imports: [SequelizeModule.forFeature([Products, ProductsImage, ProductsFeatures, Tie_Down, Grommets, FabricsMaterial , Air_bags ,Admin, ProductsFeaturesMaster, ProductsMeasurement, ActivityLog])],

  controllers: [ProductController],
  providers: [ProductService, S3Service, ActivityLogService, ActivityLogger],
})
export class ProductModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAdminAuthenticatedMiddleware)
      .exclude(
        { path: 'product/trending', method: RequestMethod.GET },
        { path: 'product/filter-products', method: RequestMethod.GET },
    )
      .forRoutes(ProductController);
  }
}
