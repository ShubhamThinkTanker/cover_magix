import { ActivityLog } from './activity_log.schema';
export declare class ActivityLogService {
    private ActivityLogModel;
    constructor(ActivityLogModel: typeof ActivityLog);
    create(activityLogData: Partial<ActivityLog>): Promise<ActivityLog>;
    findAll(): Promise<ActivityLog[]>;
}
