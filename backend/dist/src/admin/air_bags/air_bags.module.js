"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirBagsModule = void 0;
const common_1 = require("@nestjs/common");
const air_bags_controller_1 = require("./air_bags.controller");
const air_bags_service_1 = require("./air_bags.service");
const sequelize_1 = require("@nestjs/sequelize");
const air_bags_schema_1 = require("./air_bags.schema");
const middleware_1 = require("../../../Helper/middleware");
const auth_schema_1 = require("../auth/auth.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activityLogger_1 = require("../../../Helper/activityLogger");
let AirBagsModule = exports.AirBagsModule = class AirBagsModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.EnsureAdminAuthenticatedMiddleware)
            .forRoutes(air_bags_controller_1.AirBagsController);
    }
};
exports.AirBagsModule = AirBagsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([air_bags_schema_1.Air_bags, auth_schema_1.Admin, activity_log_schema_1.ActivityLog]),
        ],
        controllers: [air_bags_controller_1.AirBagsController],
        providers: [air_bags_service_1.AirBagsService, activity_log_service_1.ActivityLogService, activityLogger_1.ActivityLogger],
    })
], AirBagsModule);
//# sourceMappingURL=air_bags.module.js.map