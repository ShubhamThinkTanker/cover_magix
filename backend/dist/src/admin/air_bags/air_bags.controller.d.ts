import { AirBagsService } from './air_bags.service';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { CreateAirBagsDto } from './dto/air_bags.Dto';
export declare class AirBagsController {
    private readonly airBagsService;
    constructor(airBagsService: AirBagsService);
    isValidMySQLId(id: string): boolean;
    airbagscreate(CreateAirBags: CreateAirBagsDto, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdAirBagsList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    getAllAirBagsList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    updateAirBagsById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    AirBagDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAirbagsListValueLabelWiseByID(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    exportExcel(res: Response, req: Request): Promise<Success | CustomCatchBlockErrorMessage>;
}
