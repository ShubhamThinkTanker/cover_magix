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
exports.ZipperController = void 0;
const zipper_schema_1 = require("./zipper.schema");
const zipper_service_1 = require("./zipper.service");
const common_1 = require("@nestjs/common");
const zipper_dto_1 = require("./dto/zipper.dto");
const commonResponse_1 = require("../../../Helper/commonResponse");
const product_schema_1 = require("../product/product.schema");
const zipper_createValidation_1 = require("./validation/zipper.createValidation");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const class_validator_1 = require("class-validator");
const platform_express_1 = require("@nestjs/platform-express");
const sequelize_1 = require("@nestjs/sequelize");
let ZipperController = exports.ZipperController = class ZipperController {
    constructor(zipperModel, s3Service, ZipperService) {
        this.zipperModel = zipperModel;
        this.s3Service = s3Service;
        this.ZipperService = ZipperService;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async zippercreate(CreateZipper, req, res, zipper_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            var fileName = `${Date.now()}-${zipper_image.originalname}`;
            const errors = {};
            const productExists = await product_schema_1.Products.findOne({
                where: { id: CreateZipper.product_id, deleted_at: null },
            });
            if (!productExists) {
                errors['product_id'] = 'This Product id does not exist';
                return new commonResponse_1.CustomResponse(res, 400, errors, 'Product id does not exist');
            }
            const zipperInput = new zipper_createValidation_1.ValidateZipper();
            zipperInput.zipper_name = CreateZipper.zipper_name;
            const validation_errors = await (0, class_validator_1.validate)(zipperInput);
            const findZipperExist = await this.ZipperService.ZipperNameExist(CreateZipper);
            if (findZipperExist) {
                errors['zipper_name'] = 'This Zipper name is already exist';
            }
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            await this.s3Service.uploadFileToS3ForZipper(zipper_image, fileName);
            const createdData = await this.ZipperService.createZipper(req.user, CreateZipper, fileName);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 Zipper Created Successfully!');
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
    async getByIdAirBagsList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ZipperId = req.params.id;
            if (!this.isValidMySQLId(ZipperId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Zipper id', 'Zipper id is not valid');
            }
            const ListData = await this.ZipperService.ZipperById(req.user, id);
            if (!ListData) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Zipper not found', 'ZipperId does not found in database');
            }
            return new commonResponse_1.Success(res, 200, ListData, '🔍 Zipper Found Successfully!');
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllZipperList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let Zipper_listing = await this.ZipperService.allZipperListing(req.body, req.user);
            if (Zipper_listing) {
                return new commonResponse_1.Success(res, 200, Zipper_listing, '🎉 All Zipper Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, Zipper_listing, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updateZipperById(id, req, res, zipper_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ZipperId = req.params.id;
            if (!this.isValidMySQLId(ZipperId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Zipper id', 'Zipper id is not valid');
            }
            const existingZipper = await this.zipperModel.findOne({ where: { id, deleted_at: null } });
            if (!existingZipper) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Zipper not found', 'ZipperID does not found in database');
            }
            const errors = {};
            const grommetInput = new zipper_createValidation_1.ValidateZipper();
            grommetInput.zipper_name = req.body.zipper_name;
            const validation_errors = await (0, class_validator_1.validate)(grommetInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Validation Error', errors);
            }
            if (zipper_image) {
                await this.s3Service.deleteZipperImage(existingZipper.zipper_image);
                var fileName = `${Date.now()}-${zipper_image.originalname}`;
                const imageUrl = await this.s3Service.uploadFileToS3ForZipper(zipper_image, fileName);
            }
            const updateData = await this.ZipperService.updateZipper(req.user, ZipperId, req.body, fileName);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, "✨ Zipper Updated Successfully!");
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, false, 'Something went wrong during update');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async ZipperDeleteById(id, req, res) {
        try {
            const ZipperId = req.params.id;
            if (!this.isValidMySQLId(ZipperId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Zipper id', 'Zipper id is not valid');
            }
            const existingZipper = await this.ZipperService.ZipperById(req.user, ZipperId);
            if (!existingZipper) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Zipper not found', 'ZipperId does not found in database');
            }
            const data = await this.ZipperService.deleteZipper(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, '🗑️ Zipper Deleted Successfully!');
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
    async getZipperListValueLabelWiseByID(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const zipperListingVL = await this.ZipperService.ZipperListingVLByID(req.user, id);
            if (zipperListingVL.length > 0) {
                return new commonResponse_1.Success(res, 200, zipperListingVL, '📋 Zipper Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 404, zipperListingVL, 'No zipper found for the provided ID');
            }
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllZipperListValueLabelWise(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let zipper_listing_VL = await this.ZipperService.allZipperListingVL(req.user);
            if (zipper_listing_VL) {
                return new commonResponse_1.Success(res, 200, zipper_listing_VL, '📋 All Zippers Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, zipper_listing_VL, 'Something went wrong');
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
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('zipper_image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zipper_dto_1.CreateZipperDto, Object, Response, Object]),
    __metadata("design:returntype", Promise)
], ZipperController.prototype, "zippercreate", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], ZipperController.prototype, "getByIdAirBagsList", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], ZipperController.prototype, "getAllZipperList", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('zipper_image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response, Object]),
    __metadata("design:returntype", Promise)
], ZipperController.prototype, "updateZipperById", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], ZipperController.prototype, "ZipperDeleteById", null);
__decorate([
    (0, common_1.Get)('list_V_L_ByID/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], ZipperController.prototype, "getZipperListValueLabelWiseByID", null);
__decorate([
    (0, common_1.Get)('list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], ZipperController.prototype, "getAllZipperListValueLabelWise", null);
exports.ZipperController = ZipperController = __decorate([
    (0, common_1.Controller)('zipper'),
    __param(0, (0, sequelize_1.InjectModel)(zipper_schema_1.Zipper)),
    __metadata("design:paramtypes", [Object, S3Bucket_1.S3Service,
        zipper_service_1.ZipperService])
], ZipperController);
//# sourceMappingURL=zipper.controller.js.map