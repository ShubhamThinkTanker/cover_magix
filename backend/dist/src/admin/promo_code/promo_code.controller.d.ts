import { PromoCodeService } from './promo_code.service';
import { CreatePromoDto } from './dto/promo_code.dto';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from 'Helper/commonResponse';
import { Products } from '../product/product.schema';
export declare class PromoCodeController {
    private readonly promoService;
    private readonly productModel;
    constructor(promoService: PromoCodeService, productModel: typeof Products);
    isValidMySQLId(id: string): boolean;
    promoCreate(CreatePromo: CreatePromoDto, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    headerPromoGet(req: any, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllPromoCodeList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdPromoCodeList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    updatePromoCodeId(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    PromoDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
}
