import { Tie_Down } from './tie_downs.schema';
import { Sequelize } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class TieDownsService {
    private tieDownModel;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(tieDownModel: typeof Tie_Down, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    createTieDown(reqUser: any, createTiwDownDto: any, fileName: any): Promise<Tie_Down>;
    TieDownNameExist(reqBody: any): Promise<Tie_Down>;
    alltieDownListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        TieDown_listing: {
            created_at: string;
            updated_at: string;
            id: number;
            tie_down_name: string;
            price: string;
            tie_down_image: string;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Tie_Down;
            dataValues: Tie_Down;
            _creationAttributes: Tie_Down;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<Tie_Down, Tie_Down>;
        }[];
    }>;
    TieDownById(reqUser: any, id: any): Promise<{
        id: number;
        tie_down_name: string;
        price: string;
        tie_down_image: string;
        created_at: string;
        updated_at: string;
    }>;
    deleteTieDown(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Tie_Down[]]>;
    allTiedownListingVL(reqUser: any): Promise<{
        value: number;
        label: string;
    }[]>;
    updateTieDown(reqUser: any, id: any, reqBody: any, file: any): Promise<[affectedCount: number]>;
    ExportExcel(): Promise<ExcelJS.Buffer>;
}
