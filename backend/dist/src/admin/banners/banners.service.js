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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const banners_schema_1 = require("./banners.schema");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let BannersService = exports.BannersService = class BannersService {
    constructor(BannerModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.BannerModel = BannerModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async createBanners(reqUser, createBannerDto, filesWithId) {
        try {
            const processBannerData = (createBannerDto, filesWithId) => {
                if (!createBannerDto || !filesWithId) {
                    throw new Error('Payload and files must be provided');
                }
                const { banner_type, promo_code, promo_status, banner_status } = createBannerDto;
                if (banner_status === 'active') {
                    throw new Error('Please change the banner status');
                }
                const banner_image = filesWithId.map((file, index) => ({
                    fileName: file.fileName,
                    status: promo_status[index] === 'true',
                    code: promo_code[index] !== 'null' ? promo_code[index] : null,
                }));
                if (banner_type === 'second') {
                    if (banner_image.length !== 1) {
                        throw new Error('Second banner should have one image only');
                    }
                }
                if (banner_type === 'third') {
                    if (banner_image.length > 3) {
                        throw new Error('third banner should have a maximum of three images');
                    }
                }
                return {
                    banner_type,
                    banner_image,
                    banner_status,
                };
            };
            const bannerData = processBannerData(createBannerDto, filesWithId);
            const newBanners = await this.BannerModel.create({
                banner_type: bannerData.banner_type,
                banner_images: bannerData.banner_image,
                banner_status: bannerData.banner_status,
                created_at: new Date(),
                created_by: reqUser.id,
            });
            return newBanners;
        }
        catch (error) {
            throw new Error(error.message || 'Error creating Banner');
        }
    }
    async firstBanner() {
        try {
            var findBanner = await this.BannerModel.findOne({
                where: { banner_type: 'first', banner_status: 'active' },
                raw: true
            });
            return findBanner;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async secondBanner() {
        try {
            var findBanner = await this.BannerModel.findOne({
                where: { banner_type: 'second', banner_status: 'active' },
                raw: true
            });
            return findBanner;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async ThirdBanner() {
        try {
            var findBanner = await this.BannerModel.findOne({
                where: { banner_type: 'third', banner_status: 'active' },
                raw: true
            });
            return findBanner;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getBannersById(reqUser, id) {
        try {
            const data = await this.BannerModel.findOne({
                where: { id },
                attributes: ['id', 'banner_type', 'banner_images', 'banner_status', 'created_at', 'updated_at'],
            });
            return data;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getAllBanners(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'banner_status';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (filter_value) {
                whereClause[sequelize_2.Op.or] = [
                    { banner_type: { [sequelize_2.Op.like]: `%${filter_value}%` } },
                ];
            }
            const { count, rows } = await this.BannerModel.findAndCountAll({
                where: whereClause,
                attributes: ['id', 'banner_type', 'banner_images', 'banner_status', 'created_at', 'updated_at', 'created_by'],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true,
            });
            const modifiedRows = rows.map((row) => {
                const bannerImages = row.banner_images.map((image) => ({
                    id: image['id'],
                    images: `${process.env.ProductS3Url}/${image['fileName']}`,
                }));
                return {
                    ...row,
                    banner_images: bannerImages,
                };
            });
            return {
                totalRecords: count,
                Product_Images_list: modifiedRows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async deleteBannersById(reqUser, id) {
        try {
            const banners = await this.BannerModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            return banners;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
};
__decorate([
    activityLogger_1.ActivityLogger.createLog('Banners', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], BannersService.prototype, "createBanners", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Banners', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BannersService.prototype, "deleteBannersById", null);
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(banners_schema_1.Banners)),
    __param(1, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], BannersService);
//# sourceMappingURL=banners.service.js.map