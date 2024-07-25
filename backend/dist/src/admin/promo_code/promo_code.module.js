"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCodeModule = void 0;
const common_1 = require("@nestjs/common");
const promo_code_service_1 = require("./promo_code.service");
const promo_code_controller_1 = require("./promo_code.controller");
const middleware_1 = require("../../../Helper/middleware");
const sequelize_1 = require("@nestjs/sequelize");
const auth_schema_1 = require("../auth/auth.schema");
const promo_code_schema_1 = require("./promo_code.schema");
const product_schema_1 = require("../product/product.schema");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let PromoCodeModule = exports.PromoCodeModule = class PromoCodeModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.EnsureAdminAuthenticatedMiddleware)
            .exclude({ path: 'promo_code/header_promo', method: common_1.RequestMethod.GET })
            .forRoutes(promo_code_controller_1.PromoCodeController);
    }
};
exports.PromoCodeModule = PromoCodeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([promo_code_schema_1.Promo_code, auth_schema_1.Admin, product_schema_1.Products, activity_log_schema_1.ActivityLog]),
        ],
        providers: [promo_code_service_1.PromoCodeService, activity_log_service_1.ActivityLogService, activityLogger_1.ActivityLogger],
        controllers: [promo_code_controller_1.PromoCodeController]
    })
], PromoCodeModule);
//# sourceMappingURL=promo_code.module.js.map