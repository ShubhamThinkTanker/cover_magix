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
exports.DeckTypeService = void 0;
const common_1 = require("@nestjs/common");
const deck_type_schema_1 = require("./deck_type.schema");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const ExcelJS = require("exceljs");
const dateFormat_1 = require("../../../Helper/dateFormat");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let DeckTypeService = exports.DeckTypeService = class DeckTypeService {
    constructor(DeckModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.DeckModel = DeckModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async createDeckType(reqUser, createDeckDto, fileName) {
        try {
            const { deck_name, price } = createDeckDto;
            const newGrommet = await this.DeckModel.create({
                deck_name: deck_name,
                price: price,
                deck_image: fileName,
                created_at: new Date(),
            });
            return newGrommet;
        }
        catch (error) {
            console.error('Error creating Deck Type:', error);
            throw new common_1.BadRequestException('Could not Deck Type.');
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
        }
        catch (error) {
            throw error;
        }
    }
    async allDeckListing(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'deck_name';
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
                        if (key === 'deck_name' || key === 'price' || key === 'deck_image' || key === 'created_at' || key === 'updated_at') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
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
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at)),
                deck_image: `${process.env.DeckTypeS3Url}/${row.deck_image}`,
                price: `$${row.price}`
            }));
            return {
                totalRecords: count,
                Deck_listing: modifiedRows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
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
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteDeck(reqUser, id) {
        try {
            const deckDeleted = await this.DeckModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            return deckDeleted;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allDeckTypeListingVL(reqUser) {
        try {
            var data = await deck_type_schema_1.DeckType.findAll({
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async updateDeckTypes(reqUser, id, reqBody, file) {
        try {
            const updateDeckType = await this.DeckModel.update({
                deck_name: reqBody.deck_name?.trim(),
                price: reqBody.price?.trim(),
                deck_image: file,
            }, { where: { id: id } });
            return updateDeckType;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async ExportExcel() {
        try {
            const DectTypeData = await this.DeckModel.findAll({
                where: {
                    deleted_at: null
                },
            });
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('DectTypes');
            const headers = [
                { header: 'No', width: 20 },
                { header: 'Deck Name', key: 'deck_name', width: 30 },
                { header: 'Price', key: 'price', width: 20 },
                { header: 'Deck Image', key: 'deck_image', width: 50 },
                { header: 'Date', key: 'created_at', width: 20 },
                { header: 'Date', key: 'updated_at', width: 20 },
            ];
            worksheet.columns = headers;
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
    activityLogger_1.ActivityLogger.createLog('DeckType', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeService.prototype, "createDeckType", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('DeckType', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeService.prototype, "deleteDeck", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('DeckType', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeService.prototype, "updateDeckTypes", null);
exports.DeckTypeService = DeckTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(deck_type_schema_1.DeckType)),
    __param(1, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], DeckTypeService);
//# sourceMappingURL=deck_type.service.js.map