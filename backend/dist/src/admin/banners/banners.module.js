"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannersModule = void 0;
const common_1 = require("@nestjs/common");
const middleware_1 = require("../../../Helper/middleware");
const sequelize_1 = require("@nestjs/sequelize");
const auth_schema_1 = require("../auth/auth.schema");
const banners_schema_1 = require("./banners.schema");
const banners_service_1 = require("./banners.service");
const banners_controller_1 = require("./banners.controller");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let BannersModule = exports.BannersModule = class BannersModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.EnsureAdminAuthenticatedMiddleware)
            .exclude({ path: 'banners/first_banner', method: common_1.RequestMethod.GET }, { path: 'banners/second_banner', method: common_1.RequestMethod.GET }, { path: 'banners/third_banner', method: common_1.RequestMethod.GET })
            .forRoutes(banners_controller_1.BannersController);
    }
};
exports.BannersModule = BannersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([banners_schema_1.Banners, auth_schema_1.Admin, activity_log_schema_1.ActivityLog]),
        ],
        providers: [banners_service_1.BannersService, S3Bucket_1.S3Service, activity_log_service_1.ActivityLogService, activityLogger_1.ActivityLogger],
        controllers: [banners_controller_1.BannersController]
    })
], BannersModule);
//# sourceMappingURL=banners.module.js.map