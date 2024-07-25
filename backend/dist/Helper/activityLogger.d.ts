import { ActivityLogService } from 'src/admin/activity_log/activity_log.service';
export declare class ActivityLogger {
    private readonly activityLogService;
    constructor(activityLogService: ActivityLogService);
    private static getLocalIpAddress;
    static createLog(module: string, action: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
}
