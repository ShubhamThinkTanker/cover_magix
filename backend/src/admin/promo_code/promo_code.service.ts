import { BadRequestException, Injectable } from '@nestjs/common';
import { Promo_code } from './promo_code.schema';
import { InjectModel } from '@nestjs/sequelize';
import { formatTimestamp } from 'Helper/dateFormat';
import { Order } from 'sequelize';
import { Op } from 'sequelize';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Injectable()
export class PromoCodeService {
  constructor(
    @InjectModel(Promo_code) private promoModel: typeof Promo_code,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger: ActivityLogger
  ) { }

  @ActivityLogger.createLog('Promo Code', 'Create')
  async createPromo(reqUser: any, createPromoDto: any): Promise<Promo_code> {
    try {
      const {
        promo_type,
        code,
        description,
        header_Promo,
        max_user,
        status,
        end_date,
        start_date,
        discount_per,
        itemId,
        productIds,
      } = createPromoDto;

      if (new Date(end_date) < new Date(start_date)) {
        throw new BadRequestException('Please select a valid date range. The end date cannot be before the start date.');
      }

      // Create a new category using Sequelize's create method
      const newRating = await this.promoModel.create({
        promo_type: promo_type,
        code: code,
        description: description,
        max_user: max_user,
        status: status,
        end_date: end_date,
        start_date: start_date,
        discount_per: discount_per,
        itemId: itemId,
        productId: productIds,
        header_Promo: header_Promo,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: reqUser.id,
      });

      return newRating;
    } catch (error) {
      console.error('Error creating Rating:', error);
      throw error;
    }
  }

  async findNamePromo(body: any) {
    try {


      console.log(body);
      // Check if the promo code already exists
      const findPromo = await this.promoModel.findOne({
        where: { code: body },
        raw: true,
      });

      return findPromo

    } catch (error) {
      console.error('Error finding promo code:', error);
      throw new BadRequestException('Could not get Promo Code.');
    }
  }

  async findHeaderPromo() {
    try {

      var findPromo = await this.promoModel.findOne({
        where: { header_Promo: 1, status: 'active' },
        attributes: ['id', 'promo_type', 'code', 'description', 'discount_per'],
        raw: true
      });

      return findPromo

    } catch (error) {
      console.error('Error creating Rating:', error);
      throw new BadRequestException('Could not create Rating.');
    }
  }

  async allPromoCodesListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'id';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];

      let whereClause = { deleted_at: null };

      // if (filter_value) {
      //     whereClause[Op.or] = [
      //         { size: { [Op.like]: `%${filter_value}%` } },
      //     ];
      // }

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (key === 'promo_type' || key === 'code' || key === 'description' || key === 'status' || key === 'max_user' || key === 'end_date' || key === 'start_date' || key === 'discount_per' || key === 'created_at' || key === 'updated_at' || key === 'created_by') {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }

      const { count, rows } = await this.promoModel.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'promo_type',
          'code',
          'description',
          'max_user',
          'status',
          'end_date',
          'start_date',
          'discount_per',
          'header_Promo',
          'created_at',
          'updated_at',
          'created_by',
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
        promocode_listing: formattedRows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  async PromocodeById(reqUser, id) {
    try {
      const data = await this.promoModel.findOne({ where: { id, deleted_at: null } });

      if (!data) {
        throw new Error('Promo code not found');
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

  @ActivityLogger.createLog('Promo Code', 'Update')
  async updatePromoCode(reqUser, id, reqBody) {
    try {
      const updatedPromoCode = await this.promoModel.update(
        {
          promo_type: reqBody.promo_type,
          code: reqBody.code,
          description: reqBody.description,
          max_user: reqBody.max_user,
          status: reqBody.status,
          end_date: reqBody.end_date,
          header_Promo: reqBody.header_Promo,
          start_date: reqBody.start_date,
          discount_per: reqBody.discount_per,
          updated_at: new Date(),
        },
        {
          returning: true,
          where: { id: id, deleted_at: null },
        },
      );

      return updatedPromoCode;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Promo Code', 'Delete')
  async deletePromoById(reqUser , id) {
    try {
        const Promocode = await this.promoModel.update(
            { deleted_at: new Date() },
            {
                where: { id },
                returning: true,
            },
        );

        return Promocode;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

}
