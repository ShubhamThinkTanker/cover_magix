import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Rating } from './rating.schema';
import { Op, Sequelize, where } from 'sequelize';
import { Order } from 'sequelize';
import { formatTimestamp } from 'Helper/dateFormat';
import * as ExcelJS from 'exceljs';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Injectable()
export class RatingService {
  constructor(@InjectModel(Rating) private RatingModel: typeof Rating,
  @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
  private activityLogService: ActivityLogService,
  private acivityLogger : ActivityLogger
) { }

  async createRating(
    reqUser: any,
    createTiwDownDto: any,
    filesWithId: any
  ): Promise<Rating> {
    try {
      const { rating, comment, productId, images, status } = createTiwDownDto;

      console.log(createTiwDownDto, ":createTiwDownDto");

      // Create a new category using Sequelize's create method
      const newRating = await this.RatingModel.create({
        rating: rating,
        comment: comment,
        product_id: productId,
        images: filesWithId,
        status: status,
        created_at: new Date(),
      });

      return newRating;
    } catch (error) {
      console.error('Error creating Rating:', error);
      throw new BadRequestException('Could not create Rating.');
    }
  }
 
  @ActivityLogger.createLog('Ratings', 'Listing')
  async alltieRattingisting(reqUser, reqbody) {
    try {
      let order_column = reqbody.order_column || 'id';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];
      let whereClause = { deleted_at: null };

      if (filter_value) {
        whereClause[Op.or] = [
          { banner_type: { [Op.like]: `%${filter_value}%` } },
        ];
      }

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (key === 'rating' || key === 'comment' || key === 'images' || key === 'created_at' || key === 'updated_at') {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }

      const { count, rows } = await this.RatingModel.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'rating', 'comment', 'images', 'created_at', 'updated_at'],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      const modifiedRows = rows.map((row) => {
        const ratingImages = row.images.map((image) => ({
          id: image['id'],
          images: `${process.env.RatingsS3Url}/${image['fileName']}`,
        }));
        return {
          ...row,
          images: ratingImages,
        };
      });

      return {
        totalRecords: count,
        Rating_Images_list: modifiedRows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Ratings', 'Listing')
  async RattingById(reqUser, id) {
    try {
      const data = await this.RatingModel.findOne({
        where: { id },
        attributes: ['id', 'rating', 'comment', 'images'],
      });
      return data
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateRating(reqUser, id, reqBody, file) {
    try {

      const updatedRatings = await this.RatingModel.update(
        {
          rating: reqBody.rating,
          comment: reqBody.comment,
          product_id: reqBody.product_id,
          images: file,
          status: reqBody.status,
          updated_at: new Date(),
        },
        {
          returning: true,
          where: { id: id, deleted_at: null },
        },
      );

      // The updatedCategory variable contains the number of affected rows
      // and possibly the updated rows if the "returning" option is set.

      return updatedRatings;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Ratings', 'Delete')
  async deleteRatings(reqUser, id) {
    try {
      const ratings = await this.RatingModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true,
        },
      );

      return ratings;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Ratings', 'Status Approved')
  async findApprovedRatingsByProduct() {
    return this.RatingModel.findAll({
      where: {
        status: 'approved',
      },
    });
  }

  @ActivityLogger.createLog('Ratings', 'Status Rejected')
  async findRejectedRatingsByProduct() {
    return this.RatingModel.findAll({
      where: {
        status: 'rejected',
      },
    });
  }

  async RatingsListingVLByID(reqUser, id) {
    try {
      var data = await this.RatingModel.findAll({
        where: { id: id, deleted_at: null },
        attributes: ['id', 'rating'],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map(ratings => {
        return { value: ratings?.id, label: ratings?.rating };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async RatingsListingVL(reqUser) {
    try {
      var data = await this.RatingModel.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'rating'],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map(ratings => {
        return { value: ratings?.id, label: ratings?.rating };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Ratings', 'Status')
  async ratingStatusManage(reqUser, reqBody) {
    try {
      const { status } = reqBody;
      const statusCheck = await this.RatingModel.findAll({ where: { status: status } })
      return statusCheck

    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  // async ExportExcel() {
  //   try {
  //     const ratingsData = await this.RatingModel.findAll({
  //       where: {
  //         deleted_at: null
  //       },
  //     });

  //     const workbook = new ExcelJS.Workbook();
  //     const worksheet = workbook.addWorksheet('Ratings');

  //     // Add headers
  //     const headers = [
  //       { header: 'No', width: 20 },
  //       { header: 'Ratings', key: 'rating', width: 20 },
  //       { header: 'Comments', key: 'comment', width: 20 },
  //       { header: 'Status', key: 'status', width: 30 },
  //       { header: 'Date', key: 'created_at', width: 20 },
  //       { header: 'Date', key: 'updated_at', width: 20 },
  //     ];

  //     worksheet.columns = headers;

  //     // Add data
  //     const exportData = ratingsData.map((filedata, index) => ({
  //       id: index + 1,
  //       rating: filedata.rating,
  //       comment: filedata.comment,
  //       status: filedata.status,
  //       created_at: filedata.created_at,
  //       updated_at: filedata.updated_at,
  //     }));

  //     exportData.forEach(data => {
  //       worksheet.addRow([
  //         data.id,
  //         data.rating,
  //         data.comment,
  //         data.status,
  //         data.created_at,
  //         data.updated_at
  //       ]);
  //     });

  //     // await workbook.xlsx.writeFile(filePath);
  //     const Buffer = await workbook.xlsx.writeBuffer();

  //     console.log("Excel file written successfully.");
  //     return Buffer;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async ExportExcel() {
    try {
      const ratingData = await this.RatingModel.findAll({
        where: {
          deleted_at: null
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Ratings');

      // Add headers
      const headers = [
        { header: 'No', width: 20 },
        { header: 'Ratings', key: 'rating', width: 20 },
        { header: 'Comments', key: 'comment', width: 20 },
        { header: 'Status', key: 'status', width: 30 },
        { header: 'Image', key: 'images', width: 50 },
        { header: 'Date', key: 'created_at', width: 20 },
        { header: 'Date', key: 'updated_at', width: 20 },
      ];

      worksheet.columns = headers;

      // Add data
      const exportData = ratingData.map((filedata, index) => ({
        id: index + 1,
        rating: filedata.rating,
        comment: filedata.comment,
        status: filedata.status,
        images: filedata.images.join(', '),
        created_at: filedata.created_at,
        updated_at: filedata.updated_at,
      }));

      exportData.forEach(data => {
        const imageCell = worksheet.addRow([
          data.id,
          data.rating,
          data.comment,
          data.status,
          data.images,
          data.created_at,
          data.updated_at
        ]).getCell('images');

        imageCell.value = {
          text: data.images,
          hyperlink: `https://covermagix.s3.ap-south-1.amazonaws.com/upload/Rattings/${encodeURIComponent(data.images)}`
        };

        imageCell.style = {
          ...imageCell.style,
          font: {
            color: { argb: 'FF0000FF' },
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
