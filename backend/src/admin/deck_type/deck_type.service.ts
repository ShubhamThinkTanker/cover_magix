import { BadRequestException, Injectable } from '@nestjs/common';
import { DeckType } from './deck_type.schema';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { config } from 'dotenv';
import { Order } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { formatTimestamp } from 'Helper/dateFormat';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
@Injectable()
export class DeckTypeService {
  constructor(@InjectModel(DeckType) private DeckModel: typeof DeckType,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger: ActivityLogger
  ) { }

  @ActivityLogger.createLog('DeckType', 'Create')
  async createDeckType(
    reqUser: any,
    createDeckDto: any,
    fileName: any,
  ): Promise<DeckType> {
    try {
      const { deck_name, price } = createDeckDto;

      // Create a new category using Sequelize's create method
      const newGrommet = await this.DeckModel.create({
        deck_name: deck_name,
        price: price,
        deck_image: fileName,
        created_at: new Date(),
      });

      return newGrommet;
    } catch (error) {
      console.error('Error creating Deck Type:', error);
      throw new BadRequestException('Could not Deck Type.');
    }
  }

  async DeckNameExist(reqBody) {
    try {
      const DeckData = await this.DeckModel.findOne({
        where: { deck_name: reqBody.deck_name, deleted_at: null },
        raw: true,
        nest: true,
      });

      return DeckData;
    } catch (error) {
      throw error;
    }
  }

  async allDeckListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'deck_name';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]]; // Properly structured order array

      let whereClause = { deleted_at: null }; // Assuming deleted_at field


      //   if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
      //     whereClause[Op.or] = reqbody.filter_value.map(filter => {
      //         const key = Object.keys(filter)[0];
      //         const value = filter[key];
      //         return { [key]: { [Op.like]: `%${value}%` } };
      //     });
      // }

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (key === 'deck_name' || key === 'price' || key === 'deck_image' || key === 'created_at' || key === 'updated_at') {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }

      const { count, rows } = await this.DeckModel.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'deck_name', 'price', 'deck_image', 'created_at', 'updated_at'],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      const modifiedRows = rows.map(row => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at)),
        deck_image: `${process.env.DeckTypeS3Url}/${row.deck_image}`,
        price: `$${row.price}`
      }));

      return {
        totalRecords: count,
        Deck_listing: modifiedRows,
      };

    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async DeckById(reqUser, id) {
    try {
      const data = await this.DeckModel.findOne({
        where: { id, deleted_at: null },
        attributes: ['id', 'deck_name', 'price', 'deck_image', 'created_at', 'updated_at'],
      });
      return {
        id: data.id,
        deck_name: data.deck_name,
        price: `$${data.price}`,
        deck_image: `${process.env.DeckTypeS3Url}/${data.deck_image}`,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('DeckType', 'Delete')
  async deleteDeck(reqUser, id) {
    try {
      // Assuming Category is your Sequelize model
      const deckDeleted = await this.DeckModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true, // To return the updated row
        },
      );

      return deckDeleted;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async allDeckTypeListingVL(reqUser) {
    try {
      var data = await DeckType.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'deck_name'],
        order: [['deck_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map((deck_type) => {
        return { value: deck_type?.id, label: deck_type?.deck_name };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  @ActivityLogger.createLog('DeckType', 'Update')
  async updateDeckTypes(reqUser, id, reqBody, file) {
    try {
      const updateDeckType = await this.DeckModel.update(
        {
          deck_name: reqBody.deck_name?.trim(),
          price: reqBody.price?.trim(),
          deck_image: file,
        },
        { where: { id: id } },
      );
      return updateDeckType;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Export Excel
  async ExportExcel() {
    try {
      const DectTypeData = await this.DeckModel.findAll({
        where: {
          deleted_at: null
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('DectTypes');

      // Add headers
      const headers = [
        { header: 'No', width: 20 },
        { header: 'Deck Name', key: 'deck_name', width: 30 },
        { header: 'Price', key: 'price', width: 20 },
        { header: 'Deck Image', key: 'deck_image', width: 50 },
        { header: 'Date', key: 'created_at', width: 20 },
        { header: 'Date', key: 'updated_at', width: 20 },
      ];

      worksheet.columns = headers;

      // Add data
      const exportData = DectTypeData.map((filedata, index) => ({
        id: index + 1,
        deck_name: filedata.deck_name,
        price: filedata.price,
        deck_image: filedata.deck_image,
        created_at: filedata.created_at,
        updated_at: filedata.updated_at,
      }));

      exportData.forEach(data => {
        const imageCell = worksheet.addRow([
          data.id,
          data.deck_name,
          data.price,
          data.deck_image,
          data.created_at,
          data.updated_at
        ]).getCell('deck_image');

        imageCell.value = {
          text: data.deck_image,
          hyperlink: 'https://covermagix.s3.ap-south-1.amazonaws.com/upload/DeckType/' + encodeURIComponent(data.deck_image)
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
