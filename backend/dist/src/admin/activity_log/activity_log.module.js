"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogModule = void 0;
const common_1 = require("@nestjs/common");
const middleware_1 = require("../../../Helper/middleware");
const sequelize_1 = require("@nestjs/sequelize");
const auth_schema_1 = require("../auth/auth.schema");
const activity_log_service_1 = require("./activity_log.service");
const activity_log_controller_1 = require("./activity_log.controller");
const activity_log_schema_1 = require("./activity_log.schema");
let ActivityLogModule = exports.ActivityLogModule = class ActivityLogModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.EnsureAdminAuthenticatedMiddleware)
            .forRoutes(activity_log_controller_1.ActivityLogController);
    }
};
exports.ActivityLogModule = ActivityLogModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([activity_log_schema_1.ActivityLog, auth_schema_1.Admin]),
        ],
        providers: [activity_log_service_1.ActivityLogService],
        controllers: [activity_log_controller_1.ActivityLogController]
    })
], ActivityLogModule);
//# sourceMappingURL=activity_log.module.js.map