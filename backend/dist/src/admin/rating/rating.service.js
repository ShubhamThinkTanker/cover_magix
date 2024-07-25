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
exports.RatingService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const rating_schema_1 = require("./rating.schema");
const sequelize_2 = require("sequelize");
const ExcelJS = require("exceljs");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let RatingService = exports.RatingService = class RatingService {
    constructor(RatingModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.RatingModel = RatingModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async createRating(reqUser, createTiwDownDto, filesWithId) {
        try {
            const { rating, comment, productId, images, status } = createTiwDownDto;
            console.log(createTiwDownDto, ":createTiwDownDto");
            const newRating = await this.RatingModel.create({
                rating: rating,
                comment: comment,
                product_id: productId,
                images: filesWithId,
                status: status,
                created_at: new Date(),
            });
            return newRating;
        }
        catch (error) {
            console.error('Error creating Rating:', error);
            throw new common_1.BadRequestException('Could not create Rating.');
        }
    }
    async alltieRattingisting(reqUser, reqbody) {
        try {
            let order_column = reqbody.order_column || 'id';
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
            if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
                for (const key in reqbody.filter_value) {
                    if (reqbody.filter_value.hasOwnProperty(key)) {
                        const value = reqbody.filter_value[key];
                        if (key === 'rating' || key === 'comment' || key === 'images' || key === 'created_at' || key === 'updated_at') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async RattingById(reqUser, id) {
        try {
            const data = await this.RatingModel.findOne({
                where: { id },
                attributes: ['id', 'rating', 'comment', 'images'],
            });
            return data;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateRating(reqUser, id, reqBody, file) {
        try {
            const updatedRatings = await this.RatingModel.update({
                rating: reqBody.rating,
                comment: reqBody.comment,
                product_id: reqBody.product_id,
                images: file,
                status: reqBody.status,
                updated_at: new Date(),
            }, {
                returning: true,
                where: { id: id, deleted_at: null },
            });
            return updatedRatings;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteRatings(reqUser, id) {
        try {
            const ratings = await this.RatingModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            return ratings;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async findApprovedRatingsByProduct() {
        return this.RatingModel.findAll({
            where: {
                status: 'approved',
            },
        });
    }
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async ratingStatusManage(reqUser, reqBody) {
        try {
            const { status } = reqBody;
            const statusCheck = await this.RatingModel.findAll({ where: { status: status } });
            return statusCheck;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async ExportExcel() {
        try {
            const ratingData = await this.RatingModel.findAll({
                where: {
                    deleted_at: null
                },
            });
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Ratings');
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
    activityLogger_1.ActivityLogger.createLog('Ratings', 'Listing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RatingService.prototype, "alltieRattingisting", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Ratings', 'Listing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RatingService.prototype, "RattingById", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Ratings', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RatingService.prototype, "deleteRatings", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Ratings', 'Status Approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RatingService.prototype, "findApprovedRatingsByProduct", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Ratings', 'Status Rejected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RatingService.prototype, "findRejectedRatingsByProduct", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Ratings', 'Status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RatingService.prototype, "ratingStatusManage", null);
exports.RatingService = RatingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(rating_schema_1.Rating)),
    __param(1, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], RatingService);
//# sourceMappingURL=rating.service.js.map