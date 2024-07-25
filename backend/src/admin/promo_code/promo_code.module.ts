import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PromoCodeService } from './promo_code.service';
import { PromoCodeController } from './promo_code.controller';
import { EnsureAdminAuthenticatedMiddleware } from 'Helper/middleware';
import { TieDownsController } from '../tie_downs/tie_downs.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from '../auth/auth.schema';
import { Promo_code } from './promo_code.schema';
import { ProductService } from '../product/product.service';
import { Products } from '../product/product.schema';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Module({
  imports: [
    SequelizeModule.forFeature([Promo_code ,Admin,Products, ActivityLog]), 
  ],
  providers: [PromoCodeService, ActivityLogService, ActivityLogger ],
  controllers: [PromoCodeController]
})
export class PromoCodeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAdminAuthenticatedMiddleware)
      .exclude(
        { path: 'promo_code/header_promo', method: RequestMethod.GET } // Adjust the method and path accordingly
      )
      .forRoutes(PromoCodeController);    
  }
}

