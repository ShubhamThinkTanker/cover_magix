import { BannersService } from './banners.service';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from 'Helper/commonResponse';
import { S3Service } from 'Helper/S3Bucket';
import { Banners } from './banners.schema';
export declare class BannersController {
    private BannerModel;
    private readonly BannersService;
    private readonly s3Service;
    constructor(BannerModel: typeof Banners, BannersService: BannersService, s3Service: S3Service);
    bannersCreate(CreateRating: any, req: any, res: Response, banner_images: any): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    headerBanner(req: any, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    SecondBannerGet(req: any, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    ThirdBannerGet(req: any, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllRatingDownList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllBannersList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdBannnerList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    BannersDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
}
