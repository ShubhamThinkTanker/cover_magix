import { BadRequestException, Injectable } from '@nestjs/common';
import { Tie_Down } from './tie_downs.schema';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { config } from 'dotenv';
import { Order } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { formatTimestamp } from 'Helper/dateFormat';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
config();

@Injectable()
export class TieDownsService {
  constructor(@InjectModel(Tie_Down) private tieDownModel: typeof Tie_Down,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger: ActivityLogger
  ) { }

  @ActivityLogger.createLog('TieDowns', 'Create')
  async createTieDown(
    reqUser: any,
    createTiwDownDto: any,
    fileName: any,
  ): Promise<Tie_Down> {
    try {
      const { tie_down_name, price } = createTiwDownDto;

      // Create a new category using Sequelize's create method
      const newGrommet = await this.tieDownModel.create({
        tie_down_name: tie_down_name,
        price: price,
        tie_down_image: fileName,
        created_at: new Date(),
      });

      return newGrommet;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new BadRequestException('Could not create category.');
    }
  }

  async TieDownNameExist(reqBody) {
    try {
      const Tie_Down = await this.tieDownModel.findOne({
        where: { tie_down_name: reqBody.tie_down_name, deleted_at: null },
        raw: true,
        nest: true,
      });

      return Tie_Down;
    } catch (error) {
      throw error;
    }
  }

  // async alltieDownListing(reqbody, reqUser) {
  //   try {
  //     let order_column = reqbody.order_column || 'tie_down_name';
  //     let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
  //     let filter_value = reqbody.search || '';
  //     let offset =
  //       parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
  //     let limit = parseInt(reqbody.per_page) || 5;

  //     let order: Order = [[order_column, sort_order]]; // Properly structured order array

  //     let whereClause = { deleted_at: null }; // Assuming deleted_at field

  //     if (filter_value) {
  //       whereClause[Op.or] = [
  //         { tie_down_name: { [Op.like]: `%${filter_value}%` } },
  //       ];
  //     }

  //     const { count, rows } = await this.tieDownModel.findAndCountAll({
  //       where: whereClause,
  //       attributes: ['id', 'tie_down_name', 'price', 'tie_down_image','created_at', 'updated_at'],
  //       offset: offset,
  //       order: order,
  //       limit: limit,
  //       raw: true,
  //       nest: true,
  //     });

  //     const modifiedRows = rows.map((row) => {
  //       row.tie_down_image = `${process.env.TieDownS3Url}/${row.tie_down_image}`;
  //       row.price = `$${row.price}`;
  //       return row;
  //     });

  //     return {
  //       totalRecords: count,
  //       TieDown_listing: modifiedRows,
  //     };
  //   } catch (error) {
  //     console.log('Error : ', error);
  //     throw error; // Rethrow the error to handle it in the calling code
  //   }
  // }

  async alltieDownListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'tie_down_name';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];

      let whereClause = { deleted_at: null };

      // if (filter_value) {
      //   whereClause[Op.or] = [
      //     { tie_down_name: { [Op.like]: `%${filter_value}%` } },
      //   ];
      // }

      // if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
      //   reqbody.filter_value.forEach(filter => {
      //     const key = Object.keys(filter)[0];
      //     const value = filter[key];
      //     if (key === 'tie_down_name' || key === 'price' || key === 'created_at' || key === 'updated_at') {
      //       whereClause[key] = { [Op.like]: `%${value}%` };
      //     }
      //   });
      // }

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (key === 'tie_down_name' || key === 'price' || key === 'created_at' || key === 'updated_at') {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }

      const { count, rows } = await this.tieDownModel.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'tie_down_name', 'price', 'tie_down_image', 'created_at', 'updated_at'],
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

      // Modify other fields if needed
      const modifiedRows = formattedRows.map(row => {
        row.tie_down_image = `${process.env.TieDownS3Url}/${row.tie_down_image}`;
        row.price = `$${row.price}`;
        return row;
      });

      return {
        totalRecords: count,
        TieDown_listing: modifiedRows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  async TieDownById(reqUser, id) {
    try {
      const data = await this.tieDownModel.findOne({
        where: { id },
        attributes: ['id', 'tie_down_name', 'price', 'tie_down_image', 'created_at', 'updated_at'],
      });

      if (!data) {
        throw new Error('Tie Down not found');
      }

      // Format timestamps
      const formattedData = {
        id: data.id,
        tie_down_name: data.tie_down_name,
        price: `$${data.price}`,
        tie_down_image: `${process.env.TieDownS3Url}/${data.tie_down_image}`,
        created_at: formatTimestamp(new Date(data.created_at)),
        updated_at: formatTimestamp(new Date(data.updated_at))
      };

      return formattedData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('TieDowns', 'Delete')
  async deleteTieDown(reqUser, id) {
    try {
      // Assuming Category is your Sequelize model
      const GrommetDelete = await this.tieDownModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true, // To return the updated row
        },
      );

      return GrommetDelete;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async allTiedownListingVL(reqUser) {
    try {
      var data = await Tie_Down.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'tie_down_name'],
        order: [['tie_down_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map((tie_down) => {
        return { value: tie_down?.id, label: tie_down?.tie_down_name };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  @ActivityLogger.createLog('TieDowns', 'Update')
  async updateTieDown(reqUser, id, reqBody, file) {
    try {
      const updateTieDowns = await this.tieDownModel.update(
        {
          tie_down_name: reqBody.tie_down_name?.trim(),
          price: reqBody.price?.trim(),
          tie_down_image: file,
        },
        { where: { id: id } },
      );
      return updateTieDowns;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //Export Excel
  async ExportExcel() {
    try {
      const TieDownsData = await this.tieDownModel.findAll({
        where: {
          deleted_at: null
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('TieDowns');

      // Add headers
      const headers = [
        { header: 'No', width: 20 },
        { header: 'Tie Down Name', key: 'tie_down_name', width: 30 },
        { header: 'Price', key: 'price', width: 20 },
        { header: 'Tie Down Image', key: 'tie_down_image', width: 50 },
        { header: 'Date', key: 'created_at', width: 20 },
        { header: 'Date', key: 'updated_at', width: 20 },
      ];

      worksheet.columns = headers;

      // Add data
      const exportData = TieDownsData.map((filedata, index) => ({
        id: index + 1,
        tie_down_name: filedata.tie_down_name,
        price: filedata.price,
        tie_down_image: filedata.tie_down_image,
        created_at: filedata.created_at,
        updated_at: filedata.updated_at,
      }));

      exportData.forEach(data => {
        const imageCell = worksheet.addRow([
          data.id,
          data.tie_down_name,
          data.price,
          data.tie_down_image,
          data.created_at,
          data.updated_at
        ]).getCell('tie_down_image');

        imageCell.value = {
          text: data.tie_down_image,
          hyperlink: 'https://covermagix.s3.ap-south-1.amazonaws.com/upload/Tie_Down/' + encodeURIComponent(data.tie_down_image)
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
