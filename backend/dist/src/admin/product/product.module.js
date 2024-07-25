"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const product_schema_1 = require("./product.schema");
const productImage_schema_1 = require("./productImage.schema");
const auth_schema_1 = require("../auth/auth.schema");
const product_controller_1 = require("./product.controller");
const product_service_1 = require("./product.service");
const middleware_1 = require("../../../Helper/middleware");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const productFeatures_schema_1 = require("./productFeatures.schema");
const tie_downs_schema_1 = require("../tie_downs/tie_downs.schema");
const grommets_schema_1 = require("../grommets/grommets.schema");
const air_bags_schema_1 = require("../air_bags/air_bags.schema");
const fabricMaterial_schema_1 = require("../fabric/fabricMaterial.schema");
const productFeatureMaster_schema_1 = require("./productFeatureMaster.schema");
const product_measurement_schema_1 = require("./product_measurement.schema ");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let ProductModule = exports.ProductModule = class ProductModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.EnsureAdminAuthenticatedMiddleware)
            .exclude({ path: 'product/trending', method: common_1.RequestMethod.GET }, { path: 'product/filter-products', method: common_1.RequestMethod.GET })
            .forRoutes(product_controller_1.ProductController);
    }
};
exports.ProductModule = ProductModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([product_schema_1.Products, productImage_schema_1.ProductsImage, productFeatures_schema_1.ProductsFeatures, tie_downs_schema_1.Tie_Down, grommets_schema_1.Grommets, fabricMaterial_schema_1.FabricsMaterial, air_bags_schema_1.Air_bags, auth_schema_1.Admin, productFeatureMaster_schema_1.ProductsFeaturesMaster, product_measurement_schema_1.ProductsMeasurement, activity_log_schema_1.ActivityLog])],
        controllers: [product_controller_1.ProductController],
        providers: [product_service_1.ProductService, S3Bucket_1.S3Service, activity_log_service_1.ActivityLogService, activityLogger_1.ActivityLogger],
    })
], ProductModule);
//# sourceMappingURL=product.module.js.map