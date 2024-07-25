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
exports.DeckTypeController = void 0;
const common_1 = require("@nestjs/common");
const commonResponse_1 = require("../../../Helper/commonResponse");
const deck_type_service_1 = require("./deck_type.service");
const class_validator_1 = require("class-validator");
const multer_1 = require("@nestjs/platform-express/multer");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const deck_type_createValidation_1 = require("./Validation/deck_type.createValidation");
const deck_type_schema_1 = require("./deck_type.schema");
const sequelize_1 = require("@nestjs/sequelize");
const createDeckType_dto_1 = require("./dto/createDeckType.dto");
const imageConfigration_1 = require("../../../Helper/imageConfigration");
let DeckTypeController = exports.DeckTypeController = class DeckTypeController {
    constructor(DeckModel, s3Service, deckService) {
        this.DeckModel = DeckModel;
        this.s3Service = s3Service;
        this.deckService = deckService;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async categoriecreate(CreateDeckType, req, res, deck_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            var fileName = `${Date.now()}-${deck_image.originalname}`;
            const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(deck_image.buffer, 150, 150);
            const errors = {};
            const deckTypeInput = new deck_type_createValidation_1.ValidateDeckType();
            deckTypeInput.deck_name = CreateDeckType.deck_name;
            deckTypeInput.price = CreateDeckType.price;
            const validation_errors = await (0, class_validator_1.validate)(deckTypeInput);
            const findGrommetExist = await this.deckService.DeckNameExist(CreateDeckType);
            if (findGrommetExist) {
                errors['deck_name'] = 'This Deck Type name is already exist';
            }
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            await this.s3Service.uploadFileToS3ForDeck({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
            const createdData = await this.deckService.createDeckType(req.user, CreateDeckType, fileName);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 Deck Type Created Successfully!');
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
    async getAllDeckList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let Deck_listing = await this.deckService.allDeckListing(req.body, req.user);
            if (Deck_listing) {
                return new commonResponse_1.Success(res, 200, Deck_listing, '🎉 All Deck Types Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, Deck_listing, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getByIdDeckList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const DeckTypeId = req.params.id;
            if (!this.isValidMySQLId(DeckTypeId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid DeckType id', 'DeckType id isnot valid');
            }
            const existingDeckType = await this.DeckModel.findOne({ where: { id, deleted_at: null } });
            if (!existingDeckType) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Grommet not found', 'GrommetID doesnot found in database');
            }
            const ListData = await this.deckService.DeckById(req.user, DeckTypeId);
            if (ListData) {
                return new commonResponse_1.Success(res, 200, ListData, '🔍 Deck Type Found Successfully!');
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
    async DeckDeleteById(id, req, res) {
        try {
            const DeckTypeId = req.params.id;
            if (!this.isValidMySQLId(DeckTypeId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid DeckType id', 'DeckType id isnot valid');
            }
            const existingDeckType = await this.DeckModel.findOne({ where: { id, deleted_at: null } });
            if (!existingDeckType) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Grommet not found', 'GrommetID doesnot found in database');
            }
            const data = await this.deckService.deleteDeck(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, "🗑️ Deck Type Deleted Successfully!");
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
    async getAllDeckTypeListValueLabelWise(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let decktype_listing_VL = await this.deckService.allDeckTypeListingVL(req.user);
            if (decktype_listing_VL) {
                return new commonResponse_1.Success(res, 200, decktype_listing_VL, '📋 All Deck Types Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, decktype_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updateDeckTypeById(id, req, res, deck_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const DeckTypeId = req.params.id;
            if (!this.isValidMySQLId(DeckTypeId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid DeckType id', 'DeckType id is not valid');
            }
            const existingDeckType = await this.DeckModel.findOne({ where: { id: DeckTypeId, deleted_at: null } });
            if (!existingDeckType) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'DeckType not found', 'DeckTypeID does not exist in the database');
            }
            const errors = {};
            const deckTypeInput = new deck_type_createValidation_1.ValidateDeckType();
            deckTypeInput.deck_name = req.body.deck_name;
            deckTypeInput.price = req.body.price;
            const validation_errors = await (0, class_validator_1.validate)(deckTypeInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.forEach((error) => {
                    errors[error.property] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Validation Error', errors);
            }
            let fileName;
            if (deck_image) {
                if (!deck_image.buffer) {
                    throw new Error('Invalid file upload');
                }
                const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(deck_image.buffer, 150, 150);
                await this.s3Service.deleteDeckTypeImage(existingDeckType.deck_image);
                fileName = `${Date.now()}-${deck_image.originalname}`;
                await this.s3Service.uploadFileToS3ForDeck({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
            }
            const updateData = await this.deckService.updateDeckTypes(req.user, DeckTypeId, req.body, fileName);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, '✨ Deck Type Updated Successfully!');
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
            const bufferData = await this.deckService.ExportExcel();
            return new commonResponse_1.Success(res, 200, bufferData, '📋 DeckType Excel Successfully Export!');
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
};
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('deck_image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createDeckType_dto_1.CreateDeckTypeDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeController.prototype, "categoriecreate", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeController.prototype, "getAllDeckList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeController.prototype, "getByIdDeckList", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeController.prototype, "DeckDeleteById", null);
__decorate([
    (0, common_1.Get)('list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeController.prototype, "getAllDeckTypeListValueLabelWise", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('deck_image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeController.prototype, "updateDeckTypeById", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DeckTypeController.prototype, "exportExcel", null);
exports.DeckTypeController = DeckTypeController = __decorate([
    (0, common_1.Controller)('deck-type'),
    __param(0, (0, sequelize_1.InjectModel)(deck_type_schema_1.DeckType)),
    __metadata("design:paramtypes", [Object, S3Bucket_1.S3Service,
        deck_type_service_1.DeckTypeService])
], DeckTypeController);
//# sourceMappingURL=deck_type.controller.js.map