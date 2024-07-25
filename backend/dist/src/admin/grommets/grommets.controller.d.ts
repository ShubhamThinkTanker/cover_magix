import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { GrommetsService } from './grommets.service';
import { Request, Response } from 'express';
import { S3Service } from '../../../Helper/S3Bucket';
import { Grommets } from './grommets.schema';
import { CreateGrommetsDto } from './dto/createGrommets.dto';
export declare class GrommetsController {
    private grommetModel;
    private readonly s3Service;
    private readonly grommetService;
    constructor(grommetModel: typeof Grommets, s3Service: S3Service, grommetService: GrommetsService);
    isValidMySQLId(id: string): boolean;
    grommetscreate(CreateGrommets: CreateGrommetsDto, req: any, res: Response, grommet_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllGrommetList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdGrommetsList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    grommetDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllGrommetListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    importExcel(data: any[], req: any, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    updateGrommetById(id: string, req: any, res: Response, grommet_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    exportExcel(res: Response, req: Request): Promise<Success | CustomCatchBlockErrorMessage>;
}
