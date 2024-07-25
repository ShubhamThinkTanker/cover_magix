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
exports.BannersController = void 0;
const common_1 = require("@nestjs/common");
const banners_service_1 = require("./banners.service");
const commonResponse_1 = require("../../../Helper/commonResponse");
const multer_1 = require("@nestjs/platform-express/multer");
const imageConfigration_1 = require("../../../Helper/imageConfigration");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const banners_schema_1 = require("./banners.schema");
const sequelize_1 = require("@nestjs/sequelize");
let BannersController = exports.BannersController = class BannersController {
    constructor(BannerModel, BannersService, s3Service) {
        this.BannerModel = BannerModel;
        this.BannersService = BannersService;
        this.s3Service = s3Service;
    }
    async bannersCreate(CreateRating, req, res, banner_images) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let filesWithId = [];
            if (banner_images.length > 0) {
                const resizedImages = await Promise.all(banner_images.map(async (file) => {
                    const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(file.buffer, 150, 150);
                    return { buffer: resizedImageBuffer, originalname: file.originalname, mimetype: file.mimetype };
                }));
                filesWithId = banner_images.map((file) => ({
                    fileName: `${Date.now()}-${file.originalname}`,
                }));
                await this.s3Service.uploadFileToS3ForBanners(resizedImages, filesWithId.map(file => file.fileName));
            }
            const createdData = await this.BannersService.createBanners(req.user, req.body, filesWithId);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🌟 Your banner has been successfully added');
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
    async headerBanner(req, res) {
        try {
            var findFirstBanner = await this.BannersService.firstBanner();
            if (findFirstBanner) {
                return new commonResponse_1.Success(res, 200, findFirstBanner, '🌟 Your banner has been successfully Get For Header');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, findFirstBanner, 'Something went wrong during creation');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async SecondBannerGet(req, res) {
        try {
            var findFirstBanner = await this.BannersService.secondBanner();
            if (findFirstBanner) {
                return new commonResponse_1.Success(res, 200, findFirstBanner, '🌟 Your banner has been successfully Get For Home Page');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, findFirstBanner, 'Something went wrong during creation');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async ThirdBannerGet(req, res) {
        try {
            var findThirdBanner = await this.BannersService.ThirdBanner();
            if (findThirdBanner) {
                return new commonResponse_1.Success(res, 200, findThirdBanner, '🌟 Your banner has been successfully Get For Home Page');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, findThirdBanner, 'Something went wrong during creation');
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
            let banner_listing = await this.BannersService.getAllBanners(req.body, req.user);
            if (banner_listing) {
                return new commonResponse_1.Success(res, 200, banner_listing, '🎉 All Banners Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, banner_listing, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllBannersList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let bannerImages = await this.BannersService.getAllBanners(req.body, req.user);
            if (bannerImages) {
                return new commonResponse_1.Success(res, 200, bannerImages, '🎉 All Banners Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, bannerImages, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getByIdBannnerList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ListData = await this.BannersService.getBannersById(req.user, id);
            if (ListData) {
                return new commonResponse_1.Success(res, 200, ListData, '🔍 Banners Found Successfully!');
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
    async BannersDeleteById(id, req, res) {
        try {
            const bannerID = req.params.id;
            const existingBanner = await this.BannerModel.findOne(bannerID);
            if (!existingBanner) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Banner ID not found', 'Banner ID does not found in database');
            }
            const data = await this.BannersService.deleteBannersById(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, '🗑️ Banners Deleted Successfully!');
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
};
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseInterceptors)((0, multer_1.FilesInterceptor)('banner_images')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Response, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "bannersCreate", null);
__decorate([
    (0, common_1.Get)('first_banner'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "headerBanner", null);
__decorate([
    (0, common_1.Get)('second_banner'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "SecondBannerGet", null);
__decorate([
    (0, common_1.Get)('third_banner'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "ThirdBannerGet", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "getAllRatingDownList", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "getAllBannersList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "getByIdBannnerList", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "BannersDeleteById", null);
exports.BannersController = BannersController = __decorate([
    (0, common_1.Controller)('banners'),
    __param(0, (0, sequelize_1.InjectModel)(banners_schema_1.Banners)),
    __metadata("design:paramtypes", [Object, banners_service_1.BannersService,
        S3Bucket_1.S3Service])
], BannersController);
//# sourceMappingURL=banners.controller.js.map