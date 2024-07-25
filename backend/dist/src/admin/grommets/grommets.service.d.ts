import { Grommets } from './grommets.schema';
import { Sequelize } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { S3Service } from '../../../Helper/S3Bucket';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class GrommetsService {
    private grommetModel;
    private readonly s3Service;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(grommetModel: typeof Grommets, s3Service: S3Service, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    createGrommet(reqUser: any, createCategoryDto: any, fileName: any): Promise<Grommets>;
    GrommetNameExist(reqBody: any): Promise<Grommets>;
    allGrommetListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Grommet_listing: {
            created_at: string;
            updated_at: string;
            grommet_image: string;
            price: string;
            id: number;
            grommet_name: string;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Grommets;
            dataValues: Grommets;
            _creationAttributes: Grommets;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<Grommets, Grommets>;
        }[];
    }>;
    GrommetById(reqUser: any, id: any): Promise<{
        id: number;
        grommet_name: string;
        price: string;
        grommet_image: string;
        created_at: string;
        updated_at: string;
    }>;
    deleteGrommet(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Grommets[]]>;
    allGrommetListingVL(reqUser: any): Promise<{
        value: number;
        label: string;
    }[]>;
    importExcel(data: any): Promise<Grommets[]>;
    updateGrommets(reqUser: any, id: any, reqBody: any, file: any): Promise<[affectedCount: number]>;
    ExportExcel(): Promise<ExcelJS.Buffer>;
}
