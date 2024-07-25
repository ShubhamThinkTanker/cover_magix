"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrommetsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const grommets_controller_1 = require("./grommets.controller");
const grommets_service_1 = require("./grommets.service");
const auth_schema_1 = require("../auth/auth.schema");
const middleware_1 = require("../../../Helper/middleware");
const grommets_schema_1 = require("./grommets.schema");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let GrommetsModule = exports.GrommetsModule = class GrommetsModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.EnsureAdminAuthenticatedMiddleware)
            .forRoutes(grommets_controller_1.GrommetsController);
    }
};
exports.GrommetsModule = GrommetsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([grommets_schema_1.Grommets, auth_schema_1.Admin, activity_log_schema_1.ActivityLog]),
        ],
        controllers: [grommets_controller_1.GrommetsController],
        providers: [grommets_service_1.GrommetsService, S3Bucket_1.S3Service, activity_log_service_1.ActivityLogService, activityLogger_1.ActivityLogger],
    })
], GrommetsModule);
//# sourceMappingURL=grommets.module.js.map