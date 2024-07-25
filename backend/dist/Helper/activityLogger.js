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
var ActivityLogger_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogger = void 0;
const common_1 = require("@nestjs/common");
const activity_log_service_1 = require("../src/admin/activity_log/activity_log.service");
const os = require("os");
let ActivityLogger = exports.ActivityLogger = ActivityLogger_1 = class ActivityLogger {
    constructor(activityLogService) {
        this.activityLogService = activityLogService;
    }
    static getLocalIpAddress() {
        const interfaces = os.networkInterfaces();
        for (const key in interfaces) {
            for (const net of interfaces[key]) {
                if (net.family === 'IPv4' && !net.internal) {
                    return net.address;
                }
            }
        }
        return 'No local IP found';
    }
    static createLog(module, action) {
        return (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value;
            descriptor.value = async function (...args) {
                const reqUser = args[0];
                try {
                    const result = await originalMethod.apply(this, args);
                    const ipAddress = ActivityLogger_1.getLocalIpAddress();
                    const activityLogService = this.activityLogService;
                    if (activityLogService) {
                        await activityLogService.create({
                            user_id: reqUser.id,
                            module,
                            action,
                            message: `${module} ${action}`,
                            ip_address: ipAddress,
                        });
                    }
                    return result;
                }
                catch (error) {
                    console.error('Error in activity logging:', error);
                    throw error;
                }
            };
        };
    }
};
exports.ActivityLogger = ActivityLogger = ActivityLogger_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [activity_log_service_1.ActivityLogService])
], ActivityLogger);
//# sourceMappingURL=activityLogger.js.map