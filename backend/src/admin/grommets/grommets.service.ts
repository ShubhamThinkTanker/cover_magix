import { BadRequestException, Injectable } from '@nestjs/common';
import { Grommets } from './grommets.schema';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { config } from 'dotenv';
import { ValidationError } from 'Helper/commonResponse';
import { S3Service } from '../../../Helper/S3Bucket';
import * as path from 'path';
import { Order } from 'sequelize';
import { formatTimestamp } from 'Helper/dateFormat';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

config();

@Injectable()
export class GrommetsService {
  constructor(
    @InjectModel(Grommets) private grommetModel: typeof Grommets,
    private readonly s3Service: S3Service,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger : ActivityLogger
  ) { }


  @ActivityLogger.createLog('Grommets', 'Create')
  async createGrommet(
    reqUser: any,
    createCategoryDto: any,
    fileName: any
  ): Promise<Grommets> {
    try {
      const { grommet_name, price } = createCategoryDto;

      // Create a new category using Sequelize's create method
      const newGrommet = await this.grommetModel.create({
        grommet_name: grommet_name,
        price: price,
        grommet_image: fileName,
        created_at: new Date()
      });

      return newGrommet;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new BadRequestException('Could not create category.');
    }
  }

  async GrommetNameExist(reqBody) {
    try {
      const Grommets = await this.grommetModel.findOne({
        where: { grommet_name: reqBody.grommet_name },
        raw: true,
        nest: true,
      });

      return Grommets;
    } catch (error) {
      throw error;
    }
  }

  async allGrommetListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'grommet_name';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];

      let whereClause = { deleted_at: null };

      // if (filter_value) {
      //   whereClause[Op.or] = [
      //     { grommet_name: { [Op.like]: `%${filter_value}%` } },
      //   ];
      // }

      // if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
      //   reqbody.filter_value.forEach(filter => {
      //     const key = Object.keys(filter)[0];
      //     const value = filter[key];
      //     if (key === 'grommet_name' || key === 'price' || key === 'grommet_image' || key === 'created_at' || key === 'updated_at') {
      //       whereClause[key] = { [Op.like]: `%${value}%` };
      //     }
      //   });
      // }

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (key === 'grommet_name' || key === 'price' || key === 'grommet_image' || key === 'created_at' || key === 'updated_at') {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }

      const { count, rows } = await this.grommetModel.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'grommet_name', 'price', 'grommet_image', 'created_at', 'updated_at'],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      // Format timestamps and modify image URL
      const modifiedRows = rows.map(row => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at)),
        grommet_image: `${process.env.GrommetS3Url}/${row.grommet_image}`,
        price: `$${row.price}`
      }));

      return {
        totalRecords: count,
        Grommet_listing: modifiedRows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }


  // async GrommetById(reqUser, id) {
  //   try {
  //     const data = await this.grommetModel.findOne({ where: { id, deleted_at: null }, attributes: ['id', 'grommet_name', 'price', 'grommet_image', 'created_at', 'updated_at'] });
  //     return {
  //       id: data.id,
  //       grommet_name: data.grommet_name,
  //       price: `$${data.price}`,
  //       grommet_image: `${process.env.GrommetS3Url}/${data.grommet_image}`,
  //     };
  //     // return data;
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }

  async GrommetById(reqUser, id) {
    try {
      const data = await this.grommetModel.findOne({ where: { id, deleted_at: null }, attributes: ['id', 'grommet_name', 'price', 'grommet_image', 'created_at', 'updated_at'] });

      if (!data) {
        throw new Error('Grommet not found');
      }

      // Format timestamps and modify price and image URL
      const formattedData = {
        id: data.id,
        grommet_name: data.grommet_name,
        price: `$${data.price}`,
        grommet_image: `${process.env.GrommetS3Url}/${data.grommet_image}`,
        created_at: formatTimestamp(new Date(data.created_at)),
        updated_at: formatTimestamp(new Date(data.updated_at))
      };

      return formattedData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Grommets', 'Delete')
  async deleteGrommet(reqUser, id) {
    try {
      // Assuming Category is your Sequelize model
      const GrommetDelete = await this.grommetModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true // To return the updated row
        }
      );


      return GrommetDelete
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async allGrommetListingVL(reqUser) {
    try {
      var data = await Grommets.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'grommet_name'],
        order: [['grommet_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map(grommet => {
        return { value: grommet?.id, label: grommet?.grommet_name };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  // async importExcel(data) {
  //   try {
  //     const newData = data.map((item, index) => {
  //       if (!item.grommet_name) {
  //         throw new ValidationError(422, `There is an error in line ${index + 2}. Please provide a valid Grommet Name`);
  //       } else if (!item.price) {
  //         throw new ValidationError(422, `There is an error in line ${index + 2}. Please provide a valid Price`);
  //       } else if (!item.grommet_image) {
  //         throw new ValidationError(422, `There is an error in line ${index + 2}. Please provide a valid Image`);
  //       }

  //       return {
  //         grommet_name: item.grommet_name,
  //         price: item.price,
  //         grommet_image: item.grommet_image
  //       };
  //     });

  //     const result = await this.grommetModel.bulkCreate(newData);
  //     return result;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async importExcel(data) {
    try {
      const newData = [];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        if (!item.grommet_name) {
          throw new ValidationError(422, `There is an error in line ${i + 1}. Please provide a valid Grommet Name`);
        } else if (!item.price) {
          throw new ValidationError(422, `There is an error in line ${i + 1}. Please provide a valid Price`);
        } else if (!item.grommet_image) {
          throw new ValidationError(422, `There is an error in line ${i + 1}. Please provide a valid Image URL`);
        }

        const imageKey = `${Date.now()}-${path.basename(item.grommet_image)}`;
        const imageUrl = await this.s3Service.uploadFileToS3FromURL(item.grommet_image, imageKey);

        newData.push({
          grommet_name: item.grommet_name,
          price: item.price,
          grommet_image: imageKey
        });
      }

      const result = await this.grommetModel.bulkCreate(newData);
      return result;
    } catch (error) {
      throw error;
    }
  }
  
  @ActivityLogger.createLog('Grommets', 'Update')
  async updateGrommets(reqUser, id, reqBody, file) {
    try {
      const updateGrommet = await this.grommetModel.update(
        {
          grommet_name: reqBody.grommet_name?.trim(),
          price: reqBody.price.trim(),
          grommet_image: file
        },
        { where: { id: id, deleted_at: null } }
      );
      return updateGrommet;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Export Excel
  async ExportExcel() {
    try {
      const GrommetData = await this.grommetModel.findAll({
        where: {
          deleted_at: null
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Grommets');

      // Add headers
      const headers = [
        { header: 'No', width: 20 },
        { header: 'Grommet Name', key: 'grommet_name', width: 30 },
        { header: 'Price', key: 'price', width: 20 },
        { header: 'Grommet Image', key: 'grommet_image', width: 50 },
        { header: 'Date', key: 'created_at', width: 20 },
        { header: 'Date', key: 'updated_at', width: 20 },
      ];

      worksheet.columns = headers;

      // Add data
      const exportData = GrommetData.map((filedata, index) => ({
        id: index + 1,
        grommet_name: filedata.grommet_name,
        price: filedata.price,
        grommet_image: filedata.grommet_image,
        created_at: filedata.created_at,
        updated_at: filedata.updated_at,
      }));

      exportData.forEach(data => {
        const imageCell = worksheet.addRow([
          data.id,
          data.grommet_name,
          data.price,
          data.grommet_image,
          data.created_at,
          data.updated_at
        ]).getCell('grommet_image');

        imageCell.value = {
          text: data.grommet_image,
          hyperlink: `https://covermagix.s3.ap-south-1.amazonaws.com/upload/Grommets/${encodeURIComponent(data.grommet_image)}`
        };

        imageCell.style = {
          ...imageCell.style,
          font: {
            color: { argb: 'FF0000FF' }, // Blue color for the hyperlink //red : FF0000
            underline: true
          }
        };
      });

      // await workbook.xlsx.writeFile(filePath);

      const Buffer = await workbook.xlsx.writeBuffer();

      console.log("Excel file written successfully.");
      return Buffer;
    } catch (error) {
      throw error;
    }
  }


}
