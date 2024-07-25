import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ActivityLog } from './activity_log.schema';

@Injectable()
export class ActivityLogService {

    constructor(@InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog) { }

    async create(activityLogData: Partial<ActivityLog>): Promise<ActivityLog> {
        const activityLog = new ActivityLog(activityLogData);
        return activityLog.save();
    }

    async findAll(): Promise<ActivityLog[]> {
        return this.ActivityLogModel.findAll<ActivityLog>();
    }

}
