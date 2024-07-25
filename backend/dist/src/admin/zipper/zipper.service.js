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
exports.ZipperService = void 0;
const common_1 = require("@nestjs/common");
const zipper_schema_1 = require("./zipper.schema");
const sequelize_1 = require("@nestjs/sequelize");
const zipper_dto_1 = require("./dto/zipper.dto");
const sequelize_2 = require("sequelize");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const dateFormat_1 = require("../../../Helper/dateFormat");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let ZipperService = exports.ZipperService = class ZipperService {
    constructor(ZipperModel, s3Service, ActivityLogModel, activityLogService, acivityLogger) {
        this.ZipperModel = ZipperModel;
        this.s3Service = s3Service;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async createZipper(reqUser, CreateZipperDto, fileName) {
        try {
            const { product_id, zipper_name } = CreateZipperDto;
            if (product_id) {
                const newZipper = await this.ZipperModel.create({
                    product_id,
                    zipper_name,
                    zipper_image: fileName,
                    created_at: new Date(),
                });
                return newZipper;
            }
            else {
                throw new Error('This Product is not available');
            }
        }
        catch (error) {
            console.error('Error creating Zipper: ', error);
            throw new common_1.BadRequestException('Could not create zipper.');
        }
    }
    async ZipperById(reqUser, id) {
        try {
            const data = await this.ZipperModel.findOne({ where: { id, deleted_at: null } });
            if (!data) {
                throw new Error('Zipper not found');
            }
            const formattedData = {
                ...data.get(),
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(data.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(data.updated_at)),
                zipper_image: `${process.env.ZipperS3Url}/${data.zipper_image}`
            };
            return formattedData;
        }
        catch (error) {
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
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
                for (const key in reqbody.filter_value) {
                    if (reqbody.filter_value.hasOwnProperty(key)) {
                        const value = reqbody.filter_value[key];
                        if (key === 'product_id' || key === 'zipper_name' || key === 'created_at' || key === 'updated_at') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
                        }
                    }
                }
            }
            const { count, rows } = await zipper_schema_1.Zipper.findAndCountAll({
                where: whereClause,
                attributes: ['id', 'product_id', 'zipper_name', 'zipper_image', 'created_at', 'updated_at'],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true
            });
            const modifiedRows = rows.map(row => ({
                ...row,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at)),
                zipper_image: `${process.env.ZipperS3Url}/${row.zipper_image}`
            }));
            return {
                totalRecords: count,
                Zipper_listing: modifiedRows,
            };
        }
        catch (error) {
            console.log(`Error: ${error}`);
            throw error;
        }
    }
    async updateZipper(reqUser, id, reqBody, file) {
        try {
            const updateGrommet = await this.ZipperModel.update({
                zipper_name: reqBody.zipper_name?.trim(),
                zipper_image: file
            }, { where: { id: id, deleted_at: null } });
            return updateGrommet;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteZipper(reqUser, id) {
        try {
            const Zipper = await this.ZipperModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            return Zipper;
        }
        catch (error) {
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async allZipperListingVL(reqUser) {
        try {
            var data = await zipper_schema_1.Zipper.findAll({
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
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
        }
        catch (error) {
            throw error;
        }
    }
};
__decorate([
    activityLogger_1.ActivityLogger.createLog('Zipper', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, zipper_dto_1.CreateZipperDto, Object]),
    __metadata("design:returntype", Promise)
], ZipperService.prototype, "createZipper", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Zipper', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ZipperService.prototype, "updateZipper", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Zipper', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ZipperService.prototype, "deleteZipper", null);
exports.ZipperService = ZipperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(zipper_schema_1.Zipper)),
    __param(2, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, S3Bucket_1.S3Service, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], ZipperService);
//# sourceMappingURL=zipper.service.js.map