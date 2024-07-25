import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { S3Service } from '../../../Helper/S3Bucket';
import { FabricService } from './fabric.service';
import { CreateFabricDto } from './dto/createFabric.dto';
import { CreateFabricMaterialDto } from './dto/createFabricMaterial.dto';
import { FabricsMaterial } from './fabricMaterial.schema';
export declare class FabricController {
    private FabricsMaterialModel;
    private readonly s3Service;
    private readonly fabricService;
    constructor(FabricsMaterialModel: typeof FabricsMaterial, s3Service: S3Service, fabricService: FabricService);
    isValidMySQLId(id: string): boolean;
    fabriccreate(CreateFabric: CreateFabricDto, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    fabricMaterialCreate(CreateFabricMaterial: CreateFabricMaterialDto, req: any, res: Response, fabric_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdFabricMaterialsList(fabric_id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllFabricMaterialsList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    fabricMaterialDeleteByID(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    getByIdFabricsList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllFabricList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    fabricDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllFabricListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllFabricMaterialsListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    updateFabricById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    updateFabricMaterialById(id: string, req: any, res: Response, fabric_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    exportExcel(res: Response, req: Request): Promise<Success | CustomCatchBlockErrorMessage>;
}
