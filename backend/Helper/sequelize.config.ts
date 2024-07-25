import { SequelizeModuleOptions } from '@nestjs/sequelize/dist/interfaces/sequelize-options.interface';
import { config } from 'dotenv';
import { Dialect } from 'sequelize';
import { Admin } from '../src/admin/auth/auth.schema';
import { Categories } from '../src/admin/categories/categories.schema';
import { Sub_Categories } from 'src/admin/sub_categories/sub_categories.schema';
import { Grommets } from 'src/admin/grommets/grommets.schema';
import { Tie_Down } from 'src/admin/tie_downs/tie_downs.schema';
import { Fabrics } from 'src/admin/fabric/fabric.schema';
import { FabricsMaterial } from 'src/admin/fabric/fabricMaterial.schema';
import { DeckType } from 'src/admin/deck_type/deck_type.schema';
import { Products } from 'src/admin/product/product.schema';
import { ProductsImage } from 'src/admin/product/productImage.schema';
import { ProductsFeatures } from 'src/admin/product/productFeatures.schema';
import { Air_bags } from 'src/admin/air_bags/air_bags.schema';
import { ProductsFeaturesMaster } from 'src/admin/product/productFeatureMaster.schema';
import { ProductsMeasurement } from 'src/admin/product/product_measurement.schema ';
import { User } from 'src/admin/user_auth/auth.schema';
import {Zipper} from 'src/admin/zipper/zipper.schema'
import { Rating } from 'src/admin/rating/rating.schema';
import { Orders } from 'src/admin/order/order.schema';
import { Promo_code } from 'src/admin/promo_code/promo_code.schema';
import { User_Address } from 'src/admin/user_auth/userAddress.schema';
import { Banners } from 'src/admin/banners/banners.schema';
import { ActivityLog } from 'src/admin/activity_log/activity_log.schema';

// Load environment variables from .env file
config();

export const sequelizeConfig: SequelizeModuleOptions = {
  dialect: process.env.DB_DIALECT as Dialect || 'mysql',
  host: process.env.DB_HOST || 'coversmagix.clulcoqubs9q.ap-south-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'db_admin',
  password: process.env.DB_PASSWORD || '8NAIIR2afVqMs69',
  database: process.env.DB_NAME || 'cover_magix',
  models: [Admin, User, Categories, Sub_Categories, Grommets, Tie_Down, Fabrics, FabricsMaterial, DeckType, Products, ProductsImage, ProductsFeatures, Air_bags, ProductsFeaturesMaster ,ProductsMeasurement, Zipper, Rating, Orders,Promo_code,User_Address, Banners,ActivityLog],

};


// Setup associations
// Categories.hasMany(Sub_Categories, { foreignKey: 'category_id' });
// Sub_Categories.belongsTo(Categories, { foreignKey: 'category_id' });