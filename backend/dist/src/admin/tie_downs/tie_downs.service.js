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
exports.TieDownsService = void 0;
const common_1 = require("@nestjs/common");
const tie_downs_schema_1 = require("./tie_downs.schema");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const dotenv_1 = require("dotenv");
const ExcelJS = require("exceljs");
const dateFormat_1 = require("../../../Helper/dateFormat");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
(0, dotenv_1.config)();
let TieDownsService = exports.TieDownsService = class TieDownsService {
    constructor(tieDownModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.tieDownModel = tieDownModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async createTieDown(reqUser, createTiwDownDto, fileName) {
        try {
            const { tie_down_name, price } = createTiwDownDto;
            const newGrommet = await this.tieDownModel.create({
                tie_down_name: tie_down_name,
                price: price,
                tie_down_image: fileName,
                created_at: new Date(),
            });
            return newGrommet;
        }
        catch (error) {
            console.error('Error creating category:', error);
            throw new common_1.BadRequestException('Could not create category.');
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
        }
        catch (error) {
            throw error;
        }
    }
    async alltieDownListing(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'tie_down_name';
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
                        if (key === 'tie_down_name' || key === 'price' || key === 'created_at' || key === 'updated_at') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
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
            const formattedRows = rows.map(row => ({
                ...row,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at))
            }));
            const modifiedRows = formattedRows.map(row => {
                row.tie_down_image = `${process.env.TieDownS3Url}/${row.tie_down_image}`;
                row.price = `$${row.price}`;
                return row;
            });
            return {
                totalRecords: count,
                TieDown_listing: modifiedRows,
            };
        }
        catch (error) {
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
            const formattedData = {
                id: data.id,
                tie_down_name: data.tie_down_name,
                price: `$${data.price}`,
                tie_down_image: `${process.env.TieDownS3Url}/${data.tie_down_image}`,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(data.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(data.updated_at))
            };
            return formattedData;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteTieDown(reqUser, id) {
        try {
            const GrommetDelete = await this.tieDownModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            return GrommetDelete;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allTiedownListingVL(reqUser) {
        try {
            var data = await tie_downs_schema_1.Tie_Down.findAll({
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async updateTieDown(reqUser, id, reqBody, file) {
        try {
            const updateTieDowns = await this.tieDownModel.update({
                tie_down_name: reqBody.tie_down_name?.trim(),
                price: reqBody.price?.trim(),
                tie_down_image: file,
            }, { where: { id: id } });
            return updateTieDowns;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async ExportExcel() {
        try {
            const TieDownsData = await this.tieDownModel.findAll({
                where: {
                    deleted_at: null
                },
            });
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('TieDowns');
            const headers = [
                { header: 'No', width: 20 },
                { header: 'Tie Down Name', key: 'tie_down_name', width: 30 },
                { header: 'Price', key: 'price', width: 20 },
                { header: 'Tie Down Image', key: 'tie_down_image', width: 50 },
                { header: 'Date', key: 'created_at', width: 20 },
                { header: 'Date', key: 'updated_at', width: 20 },
            ];
            worksheet.columns = headers;
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
                        color: { argb: 'FF0000FF' },
                        underline: true
                    }
                };
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
    activityLogger_1.ActivityLogger.createLog('TieDowns', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsService.prototype, "createTieDown", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('TieDowns', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsService.prototype, "deleteTieDown", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('TieDowns', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsService.prototype, "updateTieDown", null);
exports.TieDownsService = TieDownsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(tie_downs_schema_1.Tie_Down)),
    __param(1, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], TieDownsService);
//# sourceMappingURL=tie_downs.service.js.map