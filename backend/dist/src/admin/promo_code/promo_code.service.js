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
exports.PromoCodeService = void 0;
const common_1 = require("@nestjs/common");
const promo_code_schema_1 = require("./promo_code.schema");
const sequelize_1 = require("@nestjs/sequelize");
const dateFormat_1 = require("../../../Helper/dateFormat");
const sequelize_2 = require("sequelize");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let PromoCodeService = exports.PromoCodeService = class PromoCodeService {
    constructor(promoModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.promoModel = promoModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async createPromo(reqUser, createPromoDto) {
        try {
            const { promo_type, code, description, header_Promo, max_user, status, end_date, start_date, discount_per, itemId, productIds, } = createPromoDto;
            if (new Date(end_date) < new Date(start_date)) {
                throw new common_1.BadRequestException('Please select a valid date range. The end date cannot be before the start date.');
            }
            const newRating = await this.promoModel.create({
                promo_type: promo_type,
                code: code,
                description: description,
                max_user: max_user,
                status: status,
                end_date: end_date,
                start_date: start_date,
                discount_per: discount_per,
                itemId: itemId,
                productId: productIds,
                header_Promo: header_Promo,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: reqUser.id,
            });
            return newRating;
        }
        catch (error) {
            console.error('Error creating Rating:', error);
            throw error;
        }
    }
    async findNamePromo(body) {
        try {
            console.log(body);
            const findPromo = await this.promoModel.findOne({
                where: { code: body },
                raw: true,
            });
            return findPromo;
        }
        catch (error) {
            console.error('Error finding promo code:', error);
            throw new common_1.BadRequestException('Could not get Promo Code.');
        }
    }
    async findHeaderPromo() {
        try {
            var findPromo = await this.promoModel.findOne({
                where: { header_Promo: 1, status: 'active' },
                attributes: ['id', 'promo_type', 'code', 'description', 'discount_per'],
                raw: true
            });
            return findPromo;
        }
        catch (error) {
            console.error('Error creating Rating:', error);
            throw new common_1.BadRequestException('Could not create Rating.');
        }
    }
    async allPromoCodesListing(reqbody, reqUser) {
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
                        if (key === 'promo_type' || key === 'code' || key === 'description' || key === 'status' || key === 'max_user' || key === 'end_date' || key === 'start_date' || key === 'discount_per' || key === 'created_at' || key === 'updated_at' || key === 'created_by') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
                        }
                    }
                }
            }
            const { count, rows } = await this.promoModel.findAndCountAll({
                where: whereClause,
                attributes: [
                    'id',
                    'promo_type',
                    'code',
                    'description',
                    'max_user',
                    'status',
                    'end_date',
                    'start_date',
                    'discount_per',
                    'header_Promo',
                    'created_at',
                    'updated_at',
                    'created_by',
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
                promocode_listing: formattedRows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async PromocodeById(reqUser, id) {
        try {
            const data = await this.promoModel.findOne({ where: { id, deleted_at: null } });
            if (!data) {
                throw new Error('Promo code not found');
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
    async updatePromoCode(reqUser, id, reqBody) {
        try {
            const updatedPromoCode = await this.promoModel.update({
                promo_type: reqBody.promo_type,
                code: reqBody.code,
                description: reqBody.description,
                max_user: reqBody.max_user,
                status: reqBody.status,
                end_date: reqBody.end_date,
                header_Promo: reqBody.header_Promo,
                start_date: reqBody.start_date,
                discount_per: reqBody.discount_per,
                updated_at: new Date(),
            }, {
                returning: true,
                where: { id: id, deleted_at: null },
            });
            return updatedPromoCode;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deletePromoById(reqUser, id) {
        try {
            const Promocode = await this.promoModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            return Promocode;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
};
__decorate([
    activityLogger_1.ActivityLogger.createLog('Promo Code', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PromoCodeService.prototype, "createPromo", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Promo Code', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PromoCodeService.prototype, "updatePromoCode", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Promo Code', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PromoCodeService.prototype, "deletePromoById", null);
exports.PromoCodeService = PromoCodeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(promo_code_schema_1.Promo_code)),
    __param(1, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], PromoCodeService);
//# sourceMappingURL=promo_code.service.js.map