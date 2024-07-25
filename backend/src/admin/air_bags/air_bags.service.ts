import { BadRequestException, Injectable } from '@nestjs/common';
import { Air_bags } from './air_bags.schema';
import { Model } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { CreateAirBagsDto } from './dto/air_bags.Dto';
import { Order } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { formatTimestamp } from 'Helper/dateFormat';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Injectable()
export class AirBagsService {
    constructor(
        @InjectModel(Air_bags) private AirBagsModel: typeof Air_bags,
        @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
        private activityLogService: ActivityLogService,
        private acivityLogger: ActivityLogger
    ) { }

    @ActivityLogger.createLog('Air_bags', 'Create')
    async createAirBag(
        reqUser: any,
        CreateAirBagsDto: CreateAirBagsDto,
    ): Promise<Air_bags> {
        try {
            const { size, quantity, product_id, price } = CreateAirBagsDto;

            if (product_id) {
                const newAirBag = await this.AirBagsModel.create({
                    product_id: product_id,
                    size: size,
                    quantity: quantity,
                    price: price,
                    created_at: new Date(),
                    updated_at: new Date(),
                });

                return newAirBag;
            }
            else {
                throw new Error('This Product is not available');
            }
        } catch (error) {
            console.error('Error creating AirBag:', error);
            throw new BadRequestException('Could not create AirBag.');
        }
    }

    async AirBagsById(reqUser, id) {
        try {
            const data = await this.AirBagsModel.findOne({ where: { id, deleted_at: null } });

            if (!data) {
                throw new Error('AirBag not found');
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

    async allAirBagListing(reqbody, reqUser) {
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
                        if (key === 'product_id' || key === 'size' || key === 'quantity' || key === 'price' || key === 'created_at' || key === 'updated_at') {
                            whereClause[key] = { [Op.like]: `%${value}%` };
                        }
                    }
                }
            }

            const { count, rows } = await this.AirBagsModel.findAndCountAll({
                where: whereClause,
                attributes: [
                    'id',
                    'product_id',
                    'size',
                    'quantity',
                    'price',
                    'created_at',
                    'updated_at'
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
                AirBag_listing: formattedRows,
            };
        } catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }

    @ActivityLogger.createLog('Air_bags', 'Update')
    async updateAirBags(reqUser, id, reqBody) {
        try {
            const updatedAirBags = await this.AirBagsModel.update(
                {
                    product_id: reqBody.product_id,
                    size: reqBody.size?.trim(),
                    quantity: reqBody.quantity,
                    price: reqBody.price,
                    updated_at: new Date(),
                },
                {
                    returning: true,
                    where: { id: id, deleted_at: null },
                },
            );

            return updatedAirBags;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @ActivityLogger.createLog('Air_bags', 'Delete')
    async deleteAirBag(reqUser, id) {
        try {
            const AirBag = await this.AirBagsModel.update(
                { deleted_at: new Date() },
                {
                    where: { id },
                    returning: true,
                },
            );

            return AirBag;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async AirBagsListingVLByID(reqUser, id) {
        try {
            var data = await this.AirBagsModel.findAll({
                where: { id: id },
                attributes: ['id', 'size'],
                raw: true,
                nest: true,
            });

            const valueLabelPairs = data?.map(airbags => {
                return { value: airbags?.id, label: airbags?.size };
            });

            return valueLabelPairs;
        } catch (error) {
            console.log('Error : ', error);
            throw error; // Rethrow the error to handle it in the calling code
        }
    }

    //Export Excel
    async ExportExcel() {
        try {
            const AirBagData = await this.AirBagsModel.findAll({
                where: {
                    deleted_at: null
                },
            });

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('AirBags');

            // Add headers
            const headers = [
                { header: 'No', width: 20 },
                { header: 'Product ID', key: 'product_id', width: 30 },
                { header: 'Size', key: 'size', width: 20 },
                { header: 'Quantity', key: 'quantity', width: 20 },
                { header: 'Price', key: 'price', width: 20 },
                { header: 'Date', key: 'created_at', width: 20 },
                { header: 'Date', key: 'updated_at', width: 20 },
            ];

            worksheet.columns = headers;

            // Add data
            const exportData = AirBagData.map((filedata, index) => ({
                id: index + 1,
                product_id: filedata.product_id,
                size: filedata.size,
                quantity: filedata.quantity,
                price: filedata.price,
                created_at: filedata.created_at,
                updated_at: filedata.updated_at,
            }));

            exportData.forEach(data => {
                worksheet.addRow([
                    data.id,
                    data.product_id,
                    data.size,
                    data.quantity,
                    data.price,
                    data.created_at,
                    data.updated_at
                ]);
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
