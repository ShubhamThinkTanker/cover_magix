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
exports.GrommetsController = void 0;
const common_1 = require("@nestjs/common");
const commonResponse_1 = require("../../../Helper/commonResponse");
const grommets_service_1 = require("./grommets.service");
const class_validator_1 = require("class-validator");
const multer_1 = require("@nestjs/platform-express/multer");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const grommets_createValidation_1 = require("./Validation/grommets.createValidation");
const grommets_schema_1 = require("./grommets.schema");
const sequelize_1 = require("@nestjs/sequelize");
const createGrommets_dto_1 = require("./dto/createGrommets.dto");
const imageConfigration_1 = require("../../../Helper/imageConfigration");
let GrommetsController = exports.GrommetsController = class GrommetsController {
    constructor(grommetModel, s3Service, grommetService) {
        this.grommetModel = grommetModel;
        this.s3Service = s3Service;
        this.grommetService = grommetService;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async grommetscreate(CreateGrommets, req, res, grommet_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            var fileName = `${Date.now()}-${grommet_image.originalname}`;
            const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(grommet_image.buffer, 150, 150);
            const errors = {};
            const grommetInput = new grommets_createValidation_1.ValidateGrommets();
            grommetInput.grommet_name = CreateGrommets.grommet_name;
            grommetInput.price = CreateGrommets.price;
            const validation_errors = await (0, class_validator_1.validate)(grommetInput);
            const findGrommetExist = await this.grommetService.GrommetNameExist(CreateGrommets);
            if (findGrommetExist) {
                errors['grommet_name'] = 'This Grommet name is already exist';
            }
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            await this.s3Service.uploadFileToS3ForGrommets({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
            const createdData = await this.grommetService.createGrommet(req.user, CreateGrommets, fileName);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 Grommet Created Successfully!');
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
    async getAllGrommetList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let category_listing = await this.grommetService.allGrommetListing(req.body, req.user);
            if (category_listing) {
                return new commonResponse_1.Success(res, 200, category_listing, '🎉 All Grommets Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, category_listing, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getByIdGrommetsList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const GrommetID = req.params.id;
            if (!this.isValidMySQLId(GrommetID)) {
                return res.status(404).json({ message: 'Enter valid Grommet id' });
            }
            const existingGrommet = await this.grommetModel.findOne({ where: { id, deleted_at: null } });
            if (!existingGrommet) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Grommet not found', 'GrommetID doesnot found in database');
            }
            const ListData = await this.grommetService.GrommetById(req.user, GrommetID);
            if (ListData) {
                return new commonResponse_1.Success(res, 200, ListData, '🔍 Grommet Found Successfully!');
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
    async grommetDeleteById(id, req, res) {
        try {
            const GrommetId = req.params.id;
            if (!this.isValidMySQLId(GrommetId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Grommet id', 'Grommet id isnot valid');
            }
            const existingGrommet = await this.grommetModel.findOne({ where: { id, deleted_at: null } });
            if (!existingGrommet) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Grommet not found', 'GrommetID doesnot found in database');
            }
            const data = await this.grommetService.deleteGrommet(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, "🗑️ Grommet Deleted Successfully!");
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, data, 'Something went wrong during Serach');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllGrommetListValueLabelWise(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let grommet_listing_VL = await this.grommetService.allGrommetListingVL(req.user);
            if (grommet_listing_VL) {
                return new commonResponse_1.Success(res, 200, grommet_listing_VL, '📋 All Grommets Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, grommet_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async importExcel(data, req, res) {
        try {
            const result = await this.grommetService.importExcel(data);
            if (result) {
                return new commonResponse_1.Success(res, 200, result, "Successfully Grommet Excel Imported");
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, result, 'Something went wrong during Imported');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error.message);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updateGrommetById(id, req, res, grommet_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const GrommetId = req.params.id;
            if (!this.isValidMySQLId(GrommetId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Grommet id', 'Grommet id is not valid');
            }
            const existingGrommet = await this.grommetModel.findOne({ where: { id, deleted_at: null } });
            if (!existingGrommet) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Grommet not found', 'GrommetID doesnot found in database');
            }
            const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(grommet_image.buffer, 150, 150);
            const errors = {};
            const grommetInput = new grommets_createValidation_1.ValidateGrommets();
            grommetInput.grommet_name = req.body.grommet_name;
            grommetInput.price = req.body.price;
            const validation_errors = await (0, class_validator_1.validate)(grommetInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Validation Error', errors);
            }
            if (grommet_image) {
                await this.s3Service.deleteGrommetImage(existingGrommet.grommet_image);
                var fileName = `${Date.now()}-${grommet_image.originalname}`;
                await this.s3Service.uploadFileToS3ForGrommets({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
            }
            const updateData = await this.grommetService.updateGrommets(req.user, GrommetId, req.body, fileName);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, "✨ Grommet Updated Successfully!");
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
    async exportExcel(res, req) {
        try {
            const bufferData = await this.grommetService.ExportExcel();
            return new commonResponse_1.Success(res, 200, bufferData, '📋 Grommet Excel Successfully Export!');
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
};
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('grommet_image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createGrommets_dto_1.CreateGrommetsDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsController.prototype, "grommetscreate", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsController.prototype, "getAllGrommetList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsController.prototype, "getByIdGrommetsList", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsController.prototype, "grommetDeleteById", null);
__decorate([
    (0, common_1.Get)('list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsController.prototype, "getAllGrommetListValueLabelWise", null);
__decorate([
    (0, common_1.Post)('importExcel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsController.prototype, "importExcel", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('grommet_image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsController.prototype, "updateGrommetById", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GrommetsController.prototype, "exportExcel", null);
exports.GrommetsController = GrommetsController = __decorate([
    (0, common_1.Controller)('grommets'),
    __param(0, (0, sequelize_1.InjectModel)(grommets_schema_1.Grommets)),
    __metadata("design:paramtypes", [Object, S3Bucket_1.S3Service,
        grommets_service_1.GrommetsService])
], GrommetsController);
//# sourceMappingURL=grommets.controller.js.map