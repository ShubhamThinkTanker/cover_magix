import { Injectable } from '@nestjs/common';
import { ActivityLogService } from 'src/admin/activity_log/activity_log.service';
import * as os from 'os';

@Injectable()
export class ActivityLogger {
  constructor(private readonly activityLogService: ActivityLogService) {}

  private static getLocalIpAddress(): string {
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

  static createLog(module: string, action: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const reqUser = args[0];
        try {
          const result = await originalMethod.apply(this, args);

          const ipAddress = ActivityLogger.getLocalIpAddress();

          // Access the activityLogService from the instance
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
        } catch (error) {
          console.error('Error in activity logging:', error);
          throw error;
        }
      };
    };
  }
}
