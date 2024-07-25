"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sub_categories_schema_1 = require("./sub_categories.schema");
const product_schema_1 = require("../product/product.schema");
const auth_schema_1 = require("../auth/auth.schema");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const sub_categories_controller_1 = require("./sub_categories.controller");
const sub_categories_service_1 = require("./sub_categories.service");
const middleware_1 = require("../../../Helper/middleware");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let SubCategoriesModule = exports.SubCategoriesModule = class SubCategoriesModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.EnsureAdminAuthenticatedMiddleware)
            .exclude({ path: 'sub-categories/list_V_L_SubCategory_Products', method: common_1.RequestMethod.POST })
            .forRoutes(sub_categories_controller_1.SubCategoriesController);
    }
};
exports.SubCategoriesModule = SubCategoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([sub_categories_schema_1.Sub_Categories, product_schema_1.Products, auth_schema_1.Admin, activity_log_schema_1.ActivityLog]),
        ],
        controllers: [sub_categories_controller_1.SubCategoriesController],
        providers: [sub_categories_service_1.SubCategoriesService, S3Bucket_1.S3Service, activity_log_service_1.ActivityLogService, activityLogger_1.ActivityLogger],
    })
], SubCategoriesModule);
//# sourceMappingURL=sub_categories.module.js.map