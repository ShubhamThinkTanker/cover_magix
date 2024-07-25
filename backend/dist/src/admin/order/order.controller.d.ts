import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/createorder.dto';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from 'Helper/commonResponse';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    createOrder(createOrderDto: CreateOrderDto, req: Request, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllOrderList(req: any, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdOrderList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    deleteOrderById(orderId: number, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    findByStatus(order_status: string, req: Request, res: Response): Promise<CustomResponse | CustomCatchBlockErrorMessage>;
}
