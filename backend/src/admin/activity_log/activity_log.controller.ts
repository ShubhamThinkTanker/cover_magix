import { Controller, Post, Body, Get, Req  } from '@nestjs/common';
import { ActivityLogService } from './activity_log.service';
import { ActivityLog } from './activity_log.schema';


@Controller('activity-log')
export class ActivityLogController {

    constructor(private readonly activityLogService: ActivityLogService) { }
    @Post()
    async create(@Body() activityLogData: Partial<ActivityLog>): Promise<ActivityLog> {
        return this.activityLogService.create(activityLogData);
    }

    @Get()
    async findAll(): Promise<ActivityLog[]> {
        return this.activityLogService.findAll();
    }
}
