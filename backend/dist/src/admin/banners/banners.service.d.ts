import { Banners } from './banners.schema';
import { Sequelize } from 'sequelize';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class BannersService {
    private BannerModel;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(BannerModel: typeof Banners, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    createBanners(reqUser: any, createBannerDto: any, filesWithId: any): Promise<Banners>;
    firstBanner(): Promise<Banners>;
    secondBanner(): Promise<Banners>;
    ThirdBanner(): Promise<Banners>;
    getBannersById(reqUser: any, id: any): Promise<Banners>;
    getAllBanners(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Product_Images_list: {
            banner_images: {
                id: any;
                images: string;
            }[];
            id: number;
            banner_type: string;
            banner_status: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date;
            created_by: number;
            updated_by: number;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Banners;
            dataValues: Banners;
            _creationAttributes: Banners;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<Banners, Banners>;
        }[];
    }>;
    deleteBannersById(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Banners[]]>;
}
