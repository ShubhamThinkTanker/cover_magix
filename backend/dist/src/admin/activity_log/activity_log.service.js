"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const activity_log_schema_1 = require("./activity_log.schema");
let ActivityLogService = exports.ActivityLogService = class ActivityLogService {
    constructor(ActivityLogModel) {
        this.ActivityLogModel = ActivityLogModel;
    }
    async create(activityLogData) {
        const activityLog = new activity_log_schema_1.ActivityLog(activityLogData);
        return activityLog.save();
    }
    async findAll() {
        return this.ActivityLogModel.findAll();
    }
};
exports.ActivityLogService = ActivityLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object])
], ActivityLogService);
//# sourceMappingURL=activity_log.service.js.map