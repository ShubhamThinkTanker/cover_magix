import { Controller, Post, Body, Req, Res, Param, Get, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/createorder.dto';
import { Orders } from './order.schema';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from 'Helper/commonResponse';
import { Products } from '../product/product.schema';
import { validate } from 'class-validator';


@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('create')
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const createdOrder = await this.orderService.createOrder(createOrderDto);
      if (createdOrder) {
        return new Success(
          res,
          200,
          createdOrder,
          '🎉 Order Created Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          {},
          'Something went wrong during order creation',
        );
      }
    } catch (error) {
      console.error('Create Order Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('list')
  async getAllOrderList(@Req() req: any, @Res() res: Response) {
    try {

      const orderListing = await this.orderService.allOrderListing(
        req.user,
        req.body
      );

      if (orderListing) {
        return new Success(
          res,
          200,
          orderListing,
          '🎉 All Orders Listed Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          {},
          'Something went wrong',
        );
      }
    } catch (error) {
      console.error('Error:', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Get('list/:id')
  async getByIdOrderList(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }
      //   const orderId = req.params.id;
      //   if (orderId) {
      //     return new CustomErrorResponse(
      //       res,
      //       404,
      //       'Enter valid Order id',
      //       'Order id isnot valid',
      //     );
      //   }

      const ListData = await this.orderService.getOrderById(req.user, id);
      if (!ListData) {
        return new CustomErrorResponse(
          res,
          500,
          'AirBags not found',
          'AirBagID doesnot found in database',
        );
      }
      return new Success(res, 200, ListData, '🔍 AirBags Found Successfully!');
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('delete/:id')
  async deleteOrderById(@Param('id') orderId: number, @Req() req: any, @Res() res: Response) {
    try {
      await this.orderService.deleteOrderById(req.user, orderId);

      return new Success(
        res,
        200,
        {},
        'Order deleted successfully!',
      );
    } catch (error) {
      if (error) {
        return new CustomErrorResponse(
          res,
          404,
          'Order not found',
          error.message,
        );
      }
      console.error('Error:', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('status')
  async findByStatus(@Body('order_status') order_status: string, @Req() req: Request, @Res() res: Response) {
    try {
      if (!order_status) {
        return new CustomResponse(res, 400, {}, 'order_status is required');
      }

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(order_status)) {
        return new CustomResponse(res, 400, {}, `Invalid order status: ${order_status}`);
      }

      const result = await this.orderService.findByStatus(order_status); 
      return new CustomResponse(res, 200, result, 'Success'); 
    } catch (error) {
      return new CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
    }
  }

}
