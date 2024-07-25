import { DeckType } from './deck_type.schema';
import { Sequelize } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class DeckTypeService {
    private DeckModel;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(DeckModel: typeof DeckType, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    createDeckType(reqUser: any, createDeckDto: any, fileName: any): Promise<DeckType>;
    DeckNameExist(reqBody: any): Promise<DeckType>;
    allDeckListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Deck_listing: {
            created_at: string;
            updated_at: string;
            deck_image: string;
            price: string;
            id: number;
            deck_name: string;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: DeckType;
            dataValues: DeckType;
            _creationAttributes: DeckType;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<DeckType, DeckType>;
        }[];
    }>;
    DeckById(reqUser: any, id: any): Promise<{
        id: number;
        deck_name: string;
        price: string;
        deck_image: string;
    }>;
    deleteDeck(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: DeckType[]]>;
    allDeckTypeListingVL(reqUser: any): Promise<{
        value: number;
        label: string;
    }[]>;
    updateDeckTypes(reqUser: any, id: any, reqBody: any, file: any): Promise<[affectedCount: number]>;
    ExportExcel(): Promise<ExcelJS.Buffer>;
}
