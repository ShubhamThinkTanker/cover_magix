import { Air_bags } from './air_bags.schema';
import { Sequelize } from 'sequelize';
import { CreateAirBagsDto } from './dto/air_bags.Dto';
import * as ExcelJS from 'exceljs';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class AirBagsService {
    private AirBagsModel;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(AirBagsModel: typeof Air_bags, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    createAirBag(reqUser: any, CreateAirBagsDto: CreateAirBagsDto): Promise<Air_bags>;
    AirBagsById(reqUser: any, id: any): Promise<{
        created_at: string;
        updated_at: string;
        id: number;
        product_id: number;
        size: string;
        quantity: number;
        price: string;
        deleted_at: Date;
        createdAt?: any;
        updatedAt?: any;
        deletedAt?: any;
        version?: any;
        _attributes: Air_bags;
        dataValues: Air_bags;
        _creationAttributes: Air_bags;
        isNewRecord: boolean;
        sequelize: Sequelize;
        _model: import("sequelize").Model<Air_bags, Air_bags>;
    }>;
    allAirBagListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        AirBag_listing: {
            created_at: string;
            updated_at: string;
            id: number;
            product_id: number;
            size: string;
            quantity: number;
            price: string;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Air_bags;
            dataValues: Air_bags;
            _creationAttributes: Air_bags;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<Air_bags, Air_bags>;
        }[];
    }>;
    updateAirBags(reqUser: any, id: any, reqBody: any): Promise<[affectedCount: number, affectedRows: Air_bags[]]>;
    deleteAirBag(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Air_bags[]]>;
    AirBagsListingVLByID(reqUser: any, id: any): Promise<{
        value: number;
        label: string;
    }[]>;
    ExportExcel(): Promise<ExcelJS.Buffer>;
}
