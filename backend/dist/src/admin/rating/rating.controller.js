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
exports.RatingController = void 0;
const common_1 = require("@nestjs/common");
const rating_service_1 = require("./rating.service");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const commonResponse_1 = require("../../../Helper/commonResponse");
const platform_express_1 = require("@nestjs/platform-express");
const createRating_dto_1 = require("./dto/createRating.dto");
const imageConfigration_1 = require("../../../Helper/imageConfigration");
const uuid_1 = require("uuid");
let RatingController = exports.RatingController = class RatingController {
    constructor(rattingService, s3Service) {
        this.rattingService = rattingService;
        this.s3Service = s3Service;
    }
    async rattingCreate(CreateRating, req, res, images) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let filesWithId = [];
            if (images.length > 0) {
                const resizedImages = await Promise.all(images.map(async (file) => {
                    const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(file.buffer, 150, 150);
                    return { buffer: resizedImageBuffer, originalname: file.originalname, mimetype: file.mimetype };
                }));
                filesWithId = images.map((file) => ({
                    id: (0, uuid_1.v4)(),
                    fileName: `${Date.now()}-${file.originalname}`,
                }));
                await this.s3Service.uploadFileToS3ForRatting(resizedImages, filesWithId.map(file => file.fileName));
            }
            const createdData = await this.rattingService.createRating(req.user, CreateRating, filesWithId);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🌟 Your rating has been successfully added! Thank you for your feedback! 🌟');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, createdData, 'Something went wrong during creation');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllRatingDownList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let ratings = await this.rattingService.alltieRattingisting(req.user, req.body);
            if (ratings) {
                return new commonResponse_1.Success(res, 200, ratings, '🎉 All Ratings Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, ratings, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getByIdCategoriesList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ListData = await this.rattingService.RattingById(req.user, id);
            if (ListData) {
                return new commonResponse_1.Success(res, 200, ListData, '🔍 Rating Found Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, ListData, 'Something went wrong during Serach');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updateRating(id, req, res, images) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const existingRating = await this.rattingService.RattingById(req.user, id);
            if (!existingRating) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Rating Not Found', 'The rating you are trying to update does not exist');
            }
            let filesWithId = [];
            if (images.length > 0) {
                const resizedImages = await Promise.all(images.map(async (file) => {
                    const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(file.buffer, 150, 150);
                    return { buffer: resizedImageBuffer, originalname: file.originalname, mimetype: file.mimetype };
                }));
                filesWithId = images.map((file) => ({
                    id: (0, uuid_1.v4)(),
                    fileName: `${Date.now()}-${file.originalname}`,
                }));
                await this.s3Service.uploadFileToS3ForRatting(resizedImages, filesWithId.map(file => file.fileName));
            }
            const updatedData = await this.rattingService.updateRating(req.user, req.params.id, req.body, filesWithId);
            if (updatedData) {
                return new commonResponse_1.Success(res, 200, updatedData, '🌟 Your rating has been successfully updated! Thank you for your feedback! 🌟');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, updatedData, 'Something went wrong during the update');
            }
        }
        catch (error) {
            console.log('Update Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async RatingsDeleteById(id, req, res) {
        try {
            const ratingID = req.params.id;
            const existingRatings = await this.rattingService.deleteRatings(req.user, ratingID);
            if (!existingRatings) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Rating ID not found', 'Rating ID does not found in database');
            }
            const data = await this.rattingService.deleteRatings(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, '🗑️ Ratings Deleted Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, data, 'Something went wrong during Search');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getRatingsListValueLabelWiseByID(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ratingsListingVL = await this.rattingService.RatingsListingVLByID(req.user, id);
            if (ratingsListingVL.length > 0) {
                return new commonResponse_1.Success(res, 200, ratingsListingVL, '📋 Ratings Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 404, ratingsListingVL, 'No ratings found for the provided ID');
            }
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getRatingsListValueLabel(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ratingsListingVL = await this.rattingService.RatingsListingVL(req.user);
            if (ratingsListingVL.length > 0) {
                return new commonResponse_1.Success(res, 200, ratingsListingVL, '📋 Ratings Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 404, ratingsListingVL, 'No ratings found for the provided ID');
            }
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    findApprovedRatings() {
        return this.rattingService.findApprovedRatingsByProduct();
    }
    findRejectedRatings() {
        return this.rattingService.findRejectedRatingsByProduct();
    }
    async manageRatingStatus(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ratingStatusResult = await this.rattingService.ratingStatusManage(req.user, req.body);
            if (ratingStatusResult) {
                return new commonResponse_1.Success(res, 200, ratingStatusResult, 'Rating status managed successfully');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 404, ratingStatusResult, 'Failed to manage rating status');
            }
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async exportExcel(res, req) {
        try {
            const bufferData = await this.rattingService.ExportExcel();
            return new commonResponse_1.Success(res, 200, bufferData, '📋 Rating Excel Successfully Export!');
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
};
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createRating_dto_1.CreateRatingDto, Object, Response, Object]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "rattingCreate", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "getAllRatingDownList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "getByIdCategoriesList", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response, Object]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "updateRating", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "RatingsDeleteById", null);
__decorate([
    (0, common_1.Get)('list_V_L_ByID/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "getRatingsListValueLabelWiseByID", null);
__decorate([
    (0, common_1.Get)('list_V_L_ByID'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "getRatingsListValueLabel", null);
__decorate([
    (0, common_1.Get)('product/approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RatingController.prototype, "findApprovedRatings", null);
__decorate([
    (0, common_1.Get)('product/rejected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RatingController.prototype, "findRejectedRatings", null);
__decorate([
    (0, common_1.Post)('status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "manageRatingStatus", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Response, Request]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "exportExcel", null);
exports.RatingController = RatingController = __decorate([
    (0, common_1.Controller)('rating'),
    __metadata("design:paramtypes", [rating_service_1.RatingService,
        S3Bucket_1.S3Service])
], RatingController);
//# sourceMappingURL=rating.controller.js.map