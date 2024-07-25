import { RatingService } from './rating.service';
import { S3Service } from 'Helper/S3Bucket';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from 'Helper/commonResponse';
import { CreateRatingDto } from './dto/createRating.dto';
export declare class RatingController {
    private readonly rattingService;
    private readonly s3Service;
    constructor(rattingService: RatingService, s3Service: S3Service);
    rattingCreate(CreateRating: CreateRatingDto, req: any, res: Response, images: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllRatingDownList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdCategoriesList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    updateRating(id: string, req: any, res: Response, images: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    RatingsDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getRatingsListValueLabelWiseByID(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getRatingsListValueLabel(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    findApprovedRatings(): Promise<import("./rating.schema").Rating[]>;
    findRejectedRatings(): Promise<import("./rating.schema").Rating[]>;
    manageRatingStatus(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    exportExcel(res: Response, req: Request): Promise<Success | CustomCatchBlockErrorMessage>;
}
