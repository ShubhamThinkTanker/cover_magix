import { Fabrics } from './fabric.schema';
import { FabricsMaterial } from './fabricMaterial.schema';
import { Sequelize } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class FabricService {
    private fabricModel;
    private fabricsMaterialModel;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(fabricModel: typeof Fabrics, fabricsMaterialModel: typeof FabricsMaterial, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    FabricNameExist(reqBody: any): Promise<Fabrics>;
    CreateFabric(reqUser: any, createFabricDto: any): Promise<Fabrics>;
    createFabricMaterial(reqUser: any, createTiwDownDto: any, fileName: any): Promise<FabricsMaterial>;
    FabricsMaterialById(fabricId: any): Promise<FabricsMaterial[]>;
    allFabricMaterialsFind(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Febric_Listing: FabricsMaterial[];
    }>;
    deletefabricMaterial(reqUser: any, id: any): Promise<number>;
    FindfabricMaterial(id: any): Promise<FabricsMaterial>;
    FabricById(id: any): Promise<{
        id: number;
        fabric_name: string;
        material: string;
        ideal_for: string;
        feature: string;
        water_proof: number;
        uv_resistant: number;
        weight: string;
        warranty: string;
        fabric_type: number;
        created_at: string;
        updated_at: string;
        fabric_images: any;
    }>;
    allFabricFind(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Febric_Listing: {
            created_at: string;
            updated_at: string;
            id: number;
            fabric_name: string;
            material: string;
            ideal_for: string;
            feature: string;
            water_proof: number;
            uv_resistant: number;
            weight: string;
            warranty: string;
            fabric_type: number;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Fabrics;
            dataValues: Fabrics;
            _creationAttributes: Fabrics;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<Fabrics, Fabrics>;
        }[];
    }>;
    deleteFabric(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Fabrics[]]>;
    allFabricListingVL(reqUser: any): Promise<{
        value: number;
        label: string;
    }[]>;
    allFabricMaterialsListingVL(reqUser: any): Promise<{
        value: number;
        label: {
            fabric_id: number;
            color_name: string;
            color: string;
            fabric_image: string;
            color_suggestions: string[];
        };
    }[]>;
    updateFabric(reqUser: any, id: any, reqBody: any): Promise<[affectedCount: number, affectedRows: Fabrics[]]>;
    updateFabricMaterial(reqUser: any, id: any, reqBody: any, file: any): Promise<[affectedCount: number]>;
    ExportExcel(): Promise<ExcelJS.Buffer>;
}
