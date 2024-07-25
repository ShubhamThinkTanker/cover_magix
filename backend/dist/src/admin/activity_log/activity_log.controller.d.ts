import { ActivityLogService } from './activity_log.service';
import { ActivityLog } from './activity_log.schema';
export declare class ActivityLogController {
    private readonly activityLogService;
    constructor(activityLogService: ActivityLogService);
    create(activityLogData: Partial<ActivityLog>): Promise<ActivityLog>;
    findAll(): Promise<ActivityLog[]>;
}
