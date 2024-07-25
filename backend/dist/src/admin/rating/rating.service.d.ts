import { Rating } from './rating.schema';
import { Sequelize } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class RatingService {
    private RatingModel;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(RatingModel: typeof Rating, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    createRating(reqUser: any, createTiwDownDto: any, filesWithId: any): Promise<Rating>;
    alltieRattingisting(reqUser: any, reqbody: any): Promise<{
        totalRecords: number;
        Rating_Images_list: {
            images: {
                id: any;
                images: string;
            }[];
            id: number;
            rating: number;
            comment: string;
            product_id: number;
            product: import("../product/product.schema").Products;
            status: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Rating;
            dataValues: Rating;
            _creationAttributes: Rating;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<Rating, Rating>;
        }[];
    }>;
    RattingById(reqUser: any, id: any): Promise<Rating>;
    updateRating(reqUser: any, id: any, reqBody: any, file: any): Promise<[affectedCount: number, affectedRows: Rating[]]>;
    deleteRatings(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Rating[]]>;
    findApprovedRatingsByProduct(): Promise<Rating[]>;
    findRejectedRatingsByProduct(): Promise<Rating[]>;
    RatingsListingVLByID(reqUser: any, id: any): Promise<{
        value: number;
        label: number;
    }[]>;
    RatingsListingVL(reqUser: any): Promise<{
        value: number;
        label: number;
    }[]>;
    ratingStatusManage(reqUser: any, reqBody: any): Promise<Rating[]>;
    ExportExcel(): Promise<ExcelJS.Buffer>;
}
