import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfig } from '../Helper/sequelize.config'; // Importing Sequelize configuration
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './admin/auth/auth.module';
import { CategoryModule } from './admin/categories/categories.module';
import { config } from 'dotenv';
import { SubCategoriesModule } from './admin/sub_categories/sub_categories.module';
import { GrommetsModule } from './admin/grommets/grommets.module';
import { TieDownsModule } from './admin/tie_downs/tie_downs.module';
import { FabricModule } from './admin/fabric/fabric.module';
import { DeckTypeModule } from './admin/deck_type/deck_type.module';
import { ProductModule } from './admin/product/product.module';
import { AirBagsModule } from './admin/air_bags/air_bags.module';
import { UserAuthModule } from './admin/user_auth/auth.module';
import { ZipperModule } from './admin/zipper/zipper.module';
import { RatingModule } from './admin/rating/rating.module';
import { OrderModule } from './admin/order/order.module';
import { PromoCodeModule } from './admin/promo_code/promo_code.module';
import { BannersModule } from './admin/banners/banners.module';
import { ActivityLogModule } from './admin/activity_log/activity_log.module';

config();

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeConfig),
    AuthModule, 
    CategoryModule, 
    SubCategoriesModule, 
    GrommetsModule, 
    TieDownsModule, 
    FabricModule, 
    DeckTypeModule, 
    ProductModule,
    AirBagsModule,
    UserAuthModule,
    ZipperModule,
    RatingModule,
    OrderModule,
    PromoCodeModule,
    BannersModule
  ],
  controllers: [AppController],     
  providers: [AppService],
})
export class AppModule {}




