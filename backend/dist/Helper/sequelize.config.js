"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelizeConfig = void 0;
const dotenv_1 = require("dotenv");
const auth_schema_1 = require("../src/admin/auth/auth.schema");
const categories_schema_1 = require("../src/admin/categories/categories.schema");
const sub_categories_schema_1 = require("../src/admin/sub_categories/sub_categories.schema");
const grommets_schema_1 = require("../src/admin/grommets/grommets.schema");
const tie_downs_schema_1 = require("../src/admin/tie_downs/tie_downs.schema");
const fabric_schema_1 = require("../src/admin/fabric/fabric.schema");
const fabricMaterial_schema_1 = require("../src/admin/fabric/fabricMaterial.schema");
const deck_type_schema_1 = require("../src/admin/deck_type/deck_type.schema");
const product_schema_1 = require("../src/admin/product/product.schema");
const productImage_schema_1 = require("../src/admin/product/productImage.schema");
const productFeatures_schema_1 = require("../src/admin/product/productFeatures.schema");
const air_bags_schema_1 = require("../src/admin/air_bags/air_bags.schema");
const productFeatureMaster_schema_1 = require("../src/admin/product/productFeatureMaster.schema");
const product_measurement_schema_1 = require("../src/admin/product/product_measurement.schema ");
const auth_schema_2 = require("../src/admin/user_auth/auth.schema");
const zipper_schema_1 = require("../src/admin/zipper/zipper.schema");
const rating_schema_1 = require("../src/admin/rating/rating.schema");
const order_schema_1 = require("../src/admin/order/order.schema");
const promo_code_schema_1 = require("../src/admin/promo_code/promo_code.schema");
const userAddress_schema_1 = require("../src/admin/user_auth/userAddress.schema");
const banners_schema_1 = require("../src/admin/banners/banners.schema");
const activity_log_schema_1 = require("../src/admin/activity_log/activity_log.schema");
(0, dotenv_1.config)();
exports.sequelizeConfig = {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST || 'coversmagix.clulcoqubs9q.ap-south-1.rds.amazonaws.com',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'db_admin',
    password: process.env.DB_PASSWORD || '8NAIIR2afVqMs69',
    database: process.env.DB_NAME || 'cover_magix',
    models: [auth_schema_1.Admin, auth_schema_2.User, categories_schema_1.Categories, sub_categories_schema_1.Sub_Categories, grommets_schema_1.Grommets, tie_downs_schema_1.Tie_Down, fabric_schema_1.Fabrics, fabricMaterial_schema_1.FabricsMaterial, deck_type_schema_1.DeckType, product_schema_1.Products, productImage_schema_1.ProductsImage, productFeatures_schema_1.ProductsFeatures, air_bags_schema_1.Air_bags, productFeatureMaster_schema_1.ProductsFeaturesMaster, product_measurement_schema_1.ProductsMeasurement, zipper_schema_1.Zipper, rating_schema_1.Rating, order_schema_1.Orders, promo_code_schema_1.Promo_code, userAddress_schema_1.User_Address, banners_schema_1.Banners, activity_log_schema_1.ActivityLog],
};
//# sourceMappingURL=sequelize.config.js.map