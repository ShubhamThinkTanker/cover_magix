"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirBagsService = void 0;
const common_1 = require("@nestjs/common");
const air_bags_schema_1 = require("./air_bags.schema");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const air_bags_Dto_1 = require("./dto/air_bags.Dto");
const ExcelJS = require("exceljs");
const dateFormat_1 = require("../../../Helper/dateFormat");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let AirBagsService = exports.AirBagsService = class AirBagsService {
    constructor(AirBagsModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.AirBagsModel = AirBagsModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async createAirBag(reqUser, CreateAirBagsDto) {
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
        }
        catch (error) {
            console.error('Error creating AirBag:', error);
            throw new common_1.BadRequestException('Could not create AirBag.');
        }
    }
    async AirBagsById(reqUser, id) {
        try {
            const data = await this.AirBagsModel.findOne({ where: { id, deleted_at: null } });
            if (!data) {
                throw new Error('AirBag not found');
            }
            const formattedData = {
                ...data.get(),
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(data.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(data.updated_at)),
            };
            return formattedData;
        }
        catch (error) {
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
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
                for (const key in reqbody.filter_value) {
                    if (reqbody.filter_value.hasOwnProperty(key)) {
                        const value = reqbody.filter_value[key];
                        if (key === 'product_id' || key === 'size' || key === 'quantity' || key === 'price' || key === 'created_at' || key === 'updated_at') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
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
            const formattedRows = rows.map(row => ({
                ...row,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at))
            }));
            return {
                totalRecords: count,
                AirBag_listing: formattedRows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async updateAirBags(reqUser, id, reqBody) {
        try {
            const updatedAirBags = await this.AirBagsModel.update({
                product_id: reqBody.product_id,
                size: reqBody.size?.trim(),
                quantity: reqBody.quantity,
                price: reqBody.price,
                updated_at: new Date(),
            }, {
                returning: true,
                where: { id: id, deleted_at: null },
            });
            return updatedAirBags;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteAirBag(reqUser, id) {
        try {
            const AirBag = await this.AirBagsModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            return AirBag;
        }
        catch (error) {
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async ExportExcel() {
        try {
            const AirBagData = await this.AirBagsModel.findAll({
                where: {
                    deleted_at: null
                },
            });
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('AirBags');
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
            const Buffer = await workbook.xlsx.writeBuffer();
            console.log("Excel file written successfully.");
            return Buffer;
        }
        catch (error) {
            throw error;
        }
    }
};
__decorate([
    activityLogger_1.ActivityLogger.createLog('Air_bags', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, air_bags_Dto_1.CreateAirBagsDto]),
    __metadata("design:returntype", Promise)
], AirBagsService.prototype, "createAirBag", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Air_bags', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AirBagsService.prototype, "updateAirBags", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Air_bags', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AirBagsService.prototype, "deleteAirBag", null);
exports.AirBagsService = AirBagsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(air_bags_schema_1.Air_bags)),
    __param(1, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], AirBagsService);
//# sourceMappingURL=air_bags.service.js.map