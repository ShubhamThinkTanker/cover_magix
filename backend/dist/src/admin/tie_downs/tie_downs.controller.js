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
exports.TieDownsController = void 0;
const common_1 = require("@nestjs/common");
const commonResponse_1 = require("../../../Helper/commonResponse");
const tie_downs_service_1 = require("./tie_downs.service");
const multer_1 = require("@nestjs/platform-express/multer");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const tie_downs_createValidation_1 = require("./Validation/tie_downs.createValidation");
const class_validator_1 = require("class-validator");
const tie_downs_schema_1 = require("./tie_downs.schema");
const sequelize_1 = require("@nestjs/sequelize");
const createTie_Downs_dto_1 = require("./dto/createTie_Downs.dto");
const imageConfigration_1 = require("../../../Helper/imageConfigration");
let TieDownsController = exports.TieDownsController = class TieDownsController {
    constructor(tieDownModel, s3Service, tieDownService) {
        this.tieDownModel = tieDownModel;
        this.s3Service = s3Service;
        this.tieDownService = tieDownService;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async TieDowncreate(CreateTieDown, req, res, tie_down_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            var fileName = `${Date.now()}-${tie_down_image.originalname}`;
            const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(tie_down_image.buffer, 150, 150);
            const errors = {};
            const tieDownInput = new tie_downs_createValidation_1.ValidateTieDown();
            tieDownInput.tie_down_name = CreateTieDown.tie_down_name;
            tieDownInput.price = CreateTieDown.price;
            const validation_errors = await (0, class_validator_1.validate)(tieDownInput);
            const findTieDownExist = await this.tieDownService.TieDownNameExist(CreateTieDown);
            if (findTieDownExist) {
                errors['tie_down_name'] = 'This Tie Down name is already exist';
            }
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            await this.s3Service.uploadFileToS3ForTieDown({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
            const createdData = await this.tieDownService.createTieDown(req.user, CreateTieDown, fileName);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 Tie Down Created Successfully!');
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
    async getAllTieDownList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let category_listing = await this.tieDownService.alltieDownListing(req.body, req.user);
            if (category_listing) {
                return new commonResponse_1.Success(res, 200, category_listing, '🎉 All Tie Downs Listed Successfully!');
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
    async getByIdCategoriesList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const TieDownId = req.params.id;
            if (!this.isValidMySQLId(TieDownId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid TieDown id', 'TieDown id isnot valid');
            }
            const existingTieDown = await this.tieDownModel.findOne({ where: { id, deleted_at: null } });
            if (!existingTieDown) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'TieDown not found', 'TieDownID doesnot found in database');
            }
            const ListData = await this.tieDownService.TieDownById(req.user, id);
            if (ListData) {
                return new commonResponse_1.Success(res, 200, ListData, '🔍 Tie Down Found Successfully!');
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
    async categorieDeleteById(id, req, res) {
        try {
            const TieDownId = req.params.id;
            if (!this.isValidMySQLId(TieDownId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid TieDown id', 'TieDown id isnot valid');
            }
            const existingTieDown = await this.tieDownModel.findOne({ where: { id, deleted_at: null } });
            if (!existingTieDown) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'TieDown not found', 'TieDownID doesnot found in database');
            }
            const data = await this.tieDownService.deleteTieDown(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, "🗑️ Tie Down Deleted Successfully!");
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
            let tiedown_listing_VL = await this.tieDownService.allTiedownListingVL(req.user);
            if (tiedown_listing_VL) {
                return new commonResponse_1.Success(res, 200, tiedown_listing_VL, '📋 All Tie Downs Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, tiedown_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updateTieDownById(id, req, res, tie_down_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const TieDownId = req.params.id;
            if (!this.isValidMySQLId(TieDownId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid TieDown id', 'TieDown id isnot valid');
            }
            const existingTieDown = await this.tieDownModel.findOne({ where: { id, deleted_at: null } });
            if (!existingTieDown) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'TieDown not found', 'TieDownID doesnot found in database');
            }
            const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(tie_down_image.buffer, 150, 150);
            const errors = {};
            const tiedownInput = new tie_downs_createValidation_1.ValidateTieDown();
            tiedownInput.tie_down_name = req.body.tie_down_name;
            tiedownInput.price = req.body.price;
            const validation_errors = await (0, class_validator_1.validate)(tiedownInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Validation Error', errors);
            }
            if (tie_down_image) {
                await this.s3Service.deleteTieDownImage(existingTieDown.tie_down_image);
                var fileName = `${Date.now()}-${tie_down_image.originalname}`;
                await this.s3Service.uploadFileToS3ForTieDown({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
            }
            const updateData = await this.tieDownService.updateTieDown(req.user, id, req.body, fileName);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, "✨ Tie Down Updated Successfully!");
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
            const bufferData = await this.tieDownService.ExportExcel();
            return new commonResponse_1.Success(res, 200, bufferData, '📋 TieDown Excel Successfully Export!');
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
};
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('tie_down_image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createTie_Downs_dto_1.CreateTie_DownsDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsController.prototype, "TieDowncreate", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsController.prototype, "getAllTieDownList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsController.prototype, "getByIdCategoriesList", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsController.prototype, "categorieDeleteById", null);
__decorate([
    (0, common_1.Get)('list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsController.prototype, "getAllGrommetListValueLabelWise", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('tie_down_image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsController.prototype, "updateTieDownById", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TieDownsController.prototype, "exportExcel", null);
exports.TieDownsController = TieDownsController = __decorate([
    (0, common_1.Controller)('tie-downs'),
    __param(0, (0, sequelize_1.InjectModel)(tie_downs_schema_1.Tie_Down)),
    __metadata("design:paramtypes", [Object, S3Bucket_1.S3Service,
        tie_downs_service_1.TieDownsService])
], TieDownsController);
//# sourceMappingURL=tie_downs.controller.js.map