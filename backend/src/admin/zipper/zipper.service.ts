import { BadRequestException, Injectable } from '@nestjs/common';
import { Zipper } from './zipper.schema';
import { InjectModel } from '@nestjs/sequelize';
import { CreateZipperDto } from './dto/zipper.dto';
import { Op, Order } from 'sequelize';
import { S3Service } from '../../../Helper/S3Bucket';
import { formatTimestamp } from 'Helper/dateFormat';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Injectable()
export class ZipperService {
  constructor(
    @InjectModel(Zipper) private ZipperModel: typeof Zipper,
    private readonly s3Service: S3Service,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger : ActivityLogger
  ) { }

  @ActivityLogger.createLog('Zipper', 'Create')
  async createZipper(
    reqUser: any,
    CreateZipperDto: CreateZipperDto,
    fileName: any
  ): Promise<Zipper> {
    try {
      const { product_id, zipper_name } = CreateZipperDto

      if (product_id) {
        const newZipper = await this.ZipperModel.create({
          product_id,
          zipper_name,
          zipper_image: fileName,
          created_at: new Date(),
        })
        return newZipper
      }
      else {
        throw new Error('This Product is not available')
      }
    } catch (error) {
      console.error('Error creating Zipper: ', error)
      throw new BadRequestException('Could not create zipper.')
    }
  }

  async ZipperById(reqUser, id) {
    try {
      const data = await this.ZipperModel.findOne({ where: { id, deleted_at: null } });

      if (!data) {
        throw new Error('Zipper not found');
      }

      // Format timestamps and modify image URL
      const formattedData = {
        ...data.get(), // Get the raw data object
        created_at: formatTimestamp(new Date(data.created_at)),
        updated_at: formatTimestamp(new Date(data.updated_at)),
        zipper_image: `${process.env.ZipperS3Url}/${data.zipper_image}`
      };

      return formattedData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async allZipperListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'zipper_name';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];

      let whereClause = { deleted_at: null };

      // if (filter_value) {
      //   whereClause[Op.or] = [
      //     { size: { [Op.like]: `%${filter_value}%` } },
      //   ];
      // }

      // if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
      //   reqbody.filter_value.forEach(filter => {
      //     const key = Object.keys(filter)[0];
      //     const value = filter[key];
      //     if (key === 'product_id' || key === 'zipper_name' || key === 'created_at' || key === 'updated_at') {
      //       whereClause[key] = { [Op.like]: `%${value}%` };
      //     }
      //   });
      // }

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (key === 'product_id' || key === 'zipper_name' || key === 'created_at' || key === 'updated_at') {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }

      const { count, rows } = await Zipper.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'product_id', 'zipper_name', 'zipper_image', 'created_at', 'updated_at'],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true
      });

      // Format timestamps and modify image URL
      const modifiedRows = rows.map(row => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at)),
        zipper_image: `${process.env.ZipperS3Url}/${row.zipper_image}`
      }));

      return {
        totalRecords: count,
        Zipper_listing: modifiedRows,
      };
    } catch (error) {
      console.log(`Error: ${error}`);
      throw error;
    }
  }


  // async updateZipper(reqUser, id, reqBody){
  //   try{
  //     const updatedZipper = await this.ZipperModel.update({
  //       product_id: reqBody.product_id,
  //       zipper_name: reqBody.zipper_name?.trim(),
  //       zipper_image: reqBody.zipper_image,
  //       updated_at: new Date()
  //     },
  //   {
  //     returning: true,
  //     where: {id: id, deleted_at: null}
  //   })
  //   return updatedZipper
  //   }catch(error){
  //     console.log(error)
  //     throw error;
  //   }
  // }

  @ActivityLogger.createLog('Zipper', 'Update')
  async updateZipper(reqUser, id, reqBody, file) {
    try {
      const updateGrommet = await this.ZipperModel.update(
        {
          zipper_name: reqBody.zipper_name?.trim(),
          zipper_image: file
        },
        { where: { id: id, deleted_at: null } }
      );
      return updateGrommet;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Zipper', 'Delete')
  async deleteZipper(reqUser, id) {
    try {
      const Zipper = await this.ZipperModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true,
        },
      );

      return Zipper;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async ZipperListingVLByID(reqUser, id) {
    try {
      var data = await this.ZipperModel.findAll({
        where: { id: id, deleted_at: null },
        attributes: ['id', 'zipper_name'],
        raw: true,
        nest: true,
      });



      const valueLabelPairs = data?.map(zipper => {
        return { value: zipper?.id, label: zipper?.zipper_name, };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async allZipperListingVL(reqUser) {
    try {
      var data = await Zipper.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'zipper_name'],
        order: [['zipper_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map((zipper) => {
        return { value: zipper?.id, label: zipper?.zipper_name };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async ZipperNameExist(reqBody) {
    try {
      const Zipper = await this.ZipperModel.findOne({
        where: { zipper_name: reqBody.zipper_name },
        raw: true,
        nest: true,
      });

      return Zipper;
    } catch (error) {
      throw error;
    }
  }

}
