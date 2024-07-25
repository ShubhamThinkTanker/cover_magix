import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { DeckTypeService } from './deck_type.service';
import { Request, Response } from 'express';
import { S3Service } from '../../../Helper/S3Bucket';
import { DeckType } from './deck_type.schema';
import { CreateDeckTypeDto } from './dto/createDeckType.dto';
export declare class DeckTypeController {
    private DeckModel;
    private readonly s3Service;
    private readonly deckService;
    constructor(DeckModel: typeof DeckType, s3Service: S3Service, deckService: DeckTypeService);
    isValidMySQLId(id: string): boolean;
    categoriecreate(CreateDeckType: CreateDeckTypeDto, req: any, res: Response, deck_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllDeckList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdDeckList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    DeckDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllDeckTypeListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    updateDeckTypeById(id: string, req: any, res: Response, deck_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    exportExcel(res: Response, req: Request): Promise<Success | CustomCatchBlockErrorMessage>;
}
