import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { TieDownsService } from './tie_downs.service';
import { Request, Response } from 'express';
import { S3Service } from '../../../Helper/S3Bucket';
import { Tie_Down } from './tie_downs.schema';
import { CreateTie_DownsDto } from './dto/createTie_Downs.dto';
export declare class TieDownsController {
    private tieDownModel;
    private readonly s3Service;
    private readonly tieDownService;
    constructor(tieDownModel: typeof Tie_Down, s3Service: S3Service, tieDownService: TieDownsService);
    isValidMySQLId(id: string): boolean;
    TieDowncreate(CreateTieDown: CreateTie_DownsDto, req: any, res: Response, tie_down_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllTieDownList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdCategoriesList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    categorieDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllGrommetListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    updateTieDownById(id: string, req: any, res: Response, tie_down_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    exportExcel(res: Response, req: Request): Promise<Success | CustomCatchBlockErrorMessage>;
}
