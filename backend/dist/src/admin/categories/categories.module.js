"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryModule = void 0;
const common_1 = require("@nestjs/common");
const categories_controller_1 = require("./categories.controller");
const categories_service_1 = require("./categories.service");
const sequelize_1 = require("@nestjs/sequelize");
const categories_schema_1 = require("./categories.schema");
const middleware_1 = require("../../../Helper/middleware");
const auth_schema_1 = require("../auth/auth.schema");
const sub_categories_schema_1 = require("../sub_categories/sub_categories.schema");
const product_schema_1 = require("../product/product.schema");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activityLogger_1 = require("../../../Helper/activityLogger");
const activity_log_service_1 = require("../activity_log/activity_log.service");
let CategoryModule = exports.CategoryModule = class CategoryModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.EnsureAdminAuthenticatedMiddleware)
            .exclude({ path: 'categories/list_V_L_All_categories', method: common_1.RequestMethod.GET }, { path: 'categories/list_V_L_Products', method: common_1.RequestMethod.POST }, { path: 'categories/list_V_L_subcategory', method: common_1.RequestMethod.POST }, { path: 'categories/list_V_L_categories_Products', method: common_1.RequestMethod.POST }, { path: 'categories/Listing-menu-user', method: common_1.RequestMethod.GET })
            .forRoutes(categories_controller_1.CategoriesController);
    }
};
exports.CategoryModule = CategoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([categories_schema_1.Categories, sub_categories_schema_1.Sub_Categories, product_schema_1.Products, auth_schema_1.Admin, activity_log_schema_1.ActivityLog]),
        ],
        controllers: [categories_controller_1.CategoriesController],
        providers: [categories_service_1.CategoriesService, S3Bucket_1.S3Service, activityLogger_1.ActivityLogger, activity_log_service_1.ActivityLogService],
    })
], CategoryModule);
//# sourceMappingURL=categories.module.js.map