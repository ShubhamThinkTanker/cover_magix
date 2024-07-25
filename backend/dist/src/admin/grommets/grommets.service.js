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
exports.GrommetsService = void 0;
const common_1 = require("@nestjs/common");
const grommets_schema_1 = require("./grommets.schema");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const ExcelJS = require("exceljs");
const dotenv_1 = require("dotenv");
const commonResponse_1 = require("../../../Helper/commonResponse");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const path = require("path");
const dateFormat_1 = require("../../../Helper/dateFormat");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
(0, dotenv_1.config)();
let GrommetsService = exports.GrommetsService = class GrommetsService {
    constructor(grommetModel, s3Service, ActivityLogModel, activityLogService, acivityLogger) {
        this.grommetModel = grommetModel;
        this.s3Service = s3Service;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async createGrommet(reqUser, createCategoryDto, fileName) {
        try {
            const { grommet_name, price } = createCategoryDto;
            const newGrommet = await this.grommetModel.create({
                grommet_name: grommet_name,
                price: price,
                grommet_image: fileName,
                created_at: new Date()
            });
            return newGrommet;
        }
        catch (error) {
            console.error('Error creating category:', error);
            throw new common_1.BadRequestException('Could not create category.');
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
        }
        catch (error) {
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
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
                for (const key in reqbody.filter_value) {
                    if (reqbody.filter_value.hasOwnProperty(key)) {
                        const value = reqbody.filter_value[key];
                        if (key === 'grommet_name' || key === 'price' || key === 'grommet_image' || key === 'created_at' || key === 'updated_at') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
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
            const modifiedRows = rows.map(row => ({
                ...row,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at)),
                grommet_image: `${process.env.GrommetS3Url}/${row.grommet_image}`,
                price: `$${row.price}`
            }));
            return {
                totalRecords: count,
                Grommet_listing: modifiedRows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async GrommetById(reqUser, id) {
        try {
            const data = await this.grommetModel.findOne({ where: { id, deleted_at: null }, attributes: ['id', 'grommet_name', 'price', 'grommet_image', 'created_at', 'updated_at'] });
            if (!data) {
                throw new Error('Grommet not found');
            }
            const formattedData = {
                id: data.id,
                grommet_name: data.grommet_name,
                price: `$${data.price}`,
                grommet_image: `${process.env.GrommetS3Url}/${data.grommet_image}`,
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
    async deleteGrommet(reqUser, id) {
        try {
            const GrommetDelete = await this.grommetModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true
            });
            return GrommetDelete;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allGrommetListingVL(reqUser) {
        try {
            var data = await grommets_schema_1.Grommets.findAll({
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async importExcel(data) {
        try {
            const newData = [];
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (!item.grommet_name) {
                    throw new commonResponse_1.ValidationError(422, `There is an error in line ${i + 1}. Please provide a valid Grommet Name`);
                }
                else if (!item.price) {
                    throw new commonResponse_1.ValidationError(422, `There is an error in line ${i + 1}. Please provide a valid Price`);
                }
                else if (!item.grommet_image) {
                    throw new commonResponse_1.ValidationError(422, `There is an error in line ${i + 1}. Please provide a valid Image URL`);
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
        }
        catch (error) {
            throw error;
        }
    }
    async updateGrommets(reqUser, id, reqBody, file) {
        try {
            const updateGrommet = await this.grommetModel.update({
                grommet_name: reqBody.grommet_name?.trim(),
                price: reqBody.price.trim(),
                grommet_image: file
            }, { where: { id: id, deleted_at: null } });
            return updateGrommet;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async ExportExcel() {
        try {
            const GrommetData = await this.grommetModel.findAll({
                where: {
                    deleted_at: null
                },
            });
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Grommets');
            const headers = [
                { header: 'No', width: 20 },
                { header: 'Grommet Name', key: 'grommet_name', width: 30 },
                { header: 'Price', key: 'price', width: 20 },
                { header: 'Grommet Image', key: 'grommet_image', width: 50 },
                { header: 'Date', key: 'created_at', width: 20 },
                { header: 'Date', key: 'updated_at', width: 20 },
            ];
            worksheet.columns = headers;
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
    activityLogger_1.ActivityLogger.createLog('Grommets', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsService.prototype, "createGrommet", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Grommets', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsService.prototype, "deleteGrommet", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Grommets', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsService.prototype, "updateGrommets", null);
exports.GrommetsService = GrommetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(grommets_schema_1.Grommets)),
    __param(2, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, S3Bucket_1.S3Service, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], GrommetsService);
//# sourceMappingURL=grommets.service.js.map