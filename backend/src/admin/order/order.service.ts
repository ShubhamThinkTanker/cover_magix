import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Orders } from './order.schema';
import { CreateOrderDto } from './dto/createorder.dto';
import { formatTimestamp } from 'Helper/dateFormat';
import { Order } from 'sequelize';
import { Op } from 'sequelize';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Injectable()
export class OrderService {
  constructor(@InjectModel(Orders) private orderModel: typeof Orders,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger: ActivityLogger
  ) { }
  
  async createOrder(createOrderDto: CreateOrderDto): Promise<Orders> {
    try {
      const { productId, userId, firstName, lastName, email, phoneNumber, productName, price, description, stock, totalAmount, orderDate, address, city, state, zipcode, country, appliedCoupenId, IGST, SGST, returnStatus, orderStatus } = createOrderDto;

      if (productId) {
        const newOrder = await this.orderModel.create({
          product_id: productId,
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phoneNumber,
          product_name: productName,
          price: price,
          description: description,
          stock: stock,
          total_amount: totalAmount,
          order_date: orderDate,
          address: address,
          city: city,
          state: state,
          zipcode: zipcode,
          country: country,
          applied_coupen_id: appliedCoupenId,
          IGST: IGST,
          SGST: SGST,
          return_status: returnStatus,
          order_status: orderStatus,
          created_at: new Date(),
          updated_at: new Date(),
        });

        return newOrder;
      } else {
        throw new Error('This Product is not available');
      }
    } catch (error) {
      console.error('Error creating Order:', error);
      throw new BadRequestException('Could not create Order.');
    }
  }

  @ActivityLogger.createLog('Order', 'Listing')
  async allOrderListing(reqUser: any , reqbody: any) {
    try {
      let orderColumn = reqbody.order_column || 'id';
      let sortOrder = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filterValue = reqbody.search || '';
      let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[orderColumn, sortOrder]];

      let whereClause: any = { deleted_at: null };

      if (filterValue) {
        whereClause[Op.or] = [
          { // Add your filter conditions here
            first_name: { [Op.like]: `%${filterValue}%` },
            last_name: { [Op.like]: `%${filterValue}%` },
            // Add more filter fields if necessary
          },
        ];
      }

      const { count, rows } = await this.orderModel.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'product_id',
          'user_id',
          'first_name',
          'last_name',
          'email',
          'phone_number',
          'product_name',
          'price',
          'description',
          'stock',
          'total_amount',
          'order_date',
          'address',
          'city',
          'state',
          'zipcode',
          'country',
          'applied_coupen_id',
          'IGST',
          'SGST',
          'return_status',
          'order_status',
          'created_at',
          'updated_at',
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      // Format timestamps
      const formattedRows = rows.map(row => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at))
      }));

      return {
        totalRecords: count,
        order_listing: formattedRows,
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Order', 'Listing')
  async getOrderById(reqUser, id) {
    try {
      const data = await this.orderModel.findOne({ where: { id, deleted_at: null } });

      if (!data) {
        throw new Error('Order not found');
      }

      // Format timestamps
      const formattedData = {
        ...data.get(), // Get the raw data object
        created_at: formatTimestamp(new Date(data.created_at)),
        updated_at: formatTimestamp(new Date(data.updated_at)),
      };

      return formattedData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateOrderById(orderId: number, reqBody: any): Promise<Orders> {
    try {
      const order = await this.orderModel.findByPk(orderId);

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      await order.update(reqBody);

      return order;
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException('Could not update order.');
    }
  }
 
  async deleteOrderById(reqUser: any ,orderId: number): Promise<void> {
    try {
      const order = await this.orderModel.findByPk(orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      await order.destroy();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // async orderStatus(order_status: any) {
  //   try {

  //     const status = await this.orderModel.findAll({ where: { order_status } });
  //     return status;

  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw error;
  //   }
  // } 


  async findByStatus(order_status: string) {
    try {
      const orders = await this.orderModel.findAll({
        where: { order_status },
      });
      return orders;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Something went wrong');
    }
  }

}
