import { Zipper } from './zipper.schema';
import { CreateZipperDto } from './dto/zipper.dto';
import { S3Service } from '../../../Helper/S3Bucket';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class ZipperService {
    private ZipperModel;
    private readonly s3Service;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(ZipperModel: typeof Zipper, s3Service: S3Service, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    createZipper(reqUser: any, CreateZipperDto: CreateZipperDto, fileName: any): Promise<Zipper>;
    ZipperById(reqUser: any, id: any): Promise<{
        created_at: string;
        updated_at: string;
        zipper_image: string;
        id: number;
        product_id: number;
        zipper_name: string;
        deleted_at: Date;
        createdAt?: any;
        updatedAt?: any;
        deletedAt?: any;
        version?: any;
        _attributes: Zipper;
        dataValues: Zipper;
        _creationAttributes: Zipper;
        isNewRecord: boolean;
        sequelize: import("sequelize").Sequelize;
        _model: import("sequelize").Model<Zipper, Zipper>;
    }>;
    allZipperListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Zipper_listing: {
            created_at: string;
            updated_at: string;
            zipper_image: string;
            id: number;
            product_id: number;
            zipper_name: string;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Zipper;
            dataValues: Zipper;
            _creationAttributes: Zipper;
            isNewRecord: boolean;
            sequelize: import("sequelize").Sequelize;
            _model: import("sequelize").Model<Zipper, Zipper>;
        }[];
    }>;
    updateZipper(reqUser: any, id: any, reqBody: any, file: any): Promise<[affectedCount: number]>;
    deleteZipper(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Zipper[]]>;
    ZipperListingVLByID(reqUser: any, id: any): Promise<{
        value: number;
        label: string;
    }[]>;
    allZipperListingVL(reqUser: any): Promise<{
        value: number;
        label: string;
    }[]>;
    ZipperNameExist(reqBody: any): Promise<Zipper>;
}
