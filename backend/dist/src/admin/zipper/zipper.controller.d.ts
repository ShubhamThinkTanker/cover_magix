import { Zipper } from './zipper.schema';
import { ZipperService } from './zipper.service';
import { CreateZipperDto } from './dto/zipper.dto';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from 'Helper/commonResponse';
import { S3Service } from '../../../Helper/S3Bucket';
export declare class ZipperController {
    private zipperModel;
    private readonly s3Service;
    private readonly ZipperService;
    constructor(zipperModel: typeof Zipper, s3Service: S3Service, ZipperService: ZipperService);
    isValidMySQLId(id: string): boolean;
    zippercreate(CreateZipper: CreateZipperDto, req: any, res: Response, zipper_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdAirBagsList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    getAllZipperList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    updateZipperById(id: string, req: any, res: Response, zipper_image: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    ZipperDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getZipperListValueLabelWiseByID(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllZipperListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
}
