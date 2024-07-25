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
exports.AirBagsController = void 0;
const common_1 = require("@nestjs/common");
const air_bags_service_1 = require("./air_bags.service");
const commonResponse_1 = require("../../../Helper/commonResponse");
const air_bags_CreateValidation_1 = require("./Validation/air_bags.CreateValidation");
const class_validator_1 = require("class-validator");
const air_bags_Dto_1 = require("./dto/air_bags.Dto");
const product_schema_1 = require("../product/product.schema");
let AirBagsController = exports.AirBagsController = class AirBagsController {
    constructor(airBagsService) {
        this.airBagsService = airBagsService;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async airbagscreate(CreateAirBags, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const errors = {};
            const productExists = await product_schema_1.Products.findOne({
                where: { id: CreateAirBags.product_id, deleted_at: null },
            });
            if (!productExists) {
                errors['product_id'] = 'This Product id does not exist';
                return new commonResponse_1.CustomResponse(res, 400, errors, 'Product id does not exist');
            }
            const airBagInput = new air_bags_CreateValidation_1.ValidateAirBags();
            airBagInput.size = CreateAirBags.size;
            airBagInput.quantity = CreateAirBags.quantity;
            const validation_errors = await (0, class_validator_1.validate)(airBagInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            if (!['10" x 10"', '10" x 22"', '22" x 22"'].includes(CreateAirBags.size)) {
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Invalid size. Allowed values are: 10" x 10", 10" x 22", 22" x 22".', errors);
            }
            const createdData = await this.airBagsService.createAirBag(req.user, CreateAirBags);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 AirBags Created Successfully!');
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
            const AirBagId = req.params.id;
            if (!this.isValidMySQLId(AirBagId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid AirBag id', 'AirBag id isnot valid');
            }
            const ListData = await this.airBagsService.AirBagsById(req.user, id);
            if (!ListData) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'AirBags not found', 'AirBagID doesnot found in database');
            }
            return new commonResponse_1.Success(res, 200, ListData, '🔍 AirBags Found Successfully!');
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllAirBagsList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let AirBags_listing = await this.airBagsService.allAirBagListing(req.body, req.user);
            if (AirBags_listing) {
                return new commonResponse_1.Success(res, 200, AirBags_listing, '🎉 All AirBags Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, AirBags_listing, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updateAirBagsById(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const AirBagId = req.params.id;
            if (!this.isValidMySQLId(AirBagId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid AirBag id', 'AirBag id isnot valid');
            }
            const existingAirBag = await this.airBagsService.AirBagsById(req.user, AirBagId);
            if (!existingAirBag) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'AirBag not found', 'AirBagID doesnot found in database');
            }
            const errors = {};
            const productExists = await product_schema_1.Products.findOne({
                where: { id: req.body.product_id, deleted_at: null },
            });
            if (!productExists) {
                errors['product_id'] = 'This Product id does not exist';
                return new commonResponse_1.CustomResponse(res, 400, errors, 'Product id does not exist');
            }
            const AirBagInput = new air_bags_CreateValidation_1.ValidateAirBags();
            AirBagInput.size = req.body.size;
            AirBagInput.quantity = req.body.quantity;
            const validation_errors = await (0, class_validator_1.validate)(AirBagInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            if (!['10" x 10"', '10" x 22"', '22" x 22"'].includes(AirBagInput.size)) {
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Invalid size. Allowed values are: 10" x 10", 10" x 22", 22" x 22".', errors);
            }
            const updateData = await this.airBagsService.updateAirBags(req.user, id, req.body);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, '🎊 AirBag Updated Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, false, 'Something went wrong during Serach');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async AirBagDeleteById(id, req, res) {
        try {
            const AirBagId = req.params.id;
            if (!this.isValidMySQLId(AirBagId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid AirBag id', 'AirBag id isnot valid');
            }
            const existingAirBag = await this.airBagsService.AirBagsById(req.user, AirBagId);
            if (!existingAirBag) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'AirBag not found', 'AirBagID doesnot found in database');
            }
            const data = await this.airBagsService.deleteAirBag(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, '🗑️ AirBag Deleted Successfully!');
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
    async getAirbagsListValueLabelWiseByID(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const airBagsListingVL = await this.airBagsService.AirBagsListingVLByID(req.user, id);
            if (airBagsListingVL.length > 0) {
                return new commonResponse_1.Success(res, 200, airBagsListingVL, '📋 AirBags Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 404, airBagsListingVL, 'No airbags found for the provided ID');
            }
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async exportExcel(res, req) {
        try {
            const bufferData = await this.airBagsService.ExportExcel();
            return new commonResponse_1.Success(res, 200, bufferData, '📋 AirBags Excel Successfully Export!');
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [air_bags_Dto_1.CreateAirBagsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AirBagsController.prototype, "airbagscreate", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AirBagsController.prototype, "getByIdAirBagsList", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AirBagsController.prototype, "getAllAirBagsList", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AirBagsController.prototype, "updateAirBagsById", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AirBagsController.prototype, "AirBagDeleteById", null);
__decorate([
    (0, common_1.Get)('list_V_L_ByID/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AirBagsController.prototype, "getAirbagsListValueLabelWiseByID", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AirBagsController.prototype, "exportExcel", null);
exports.AirBagsController = AirBagsController = __decorate([
    (0, common_1.Controller)('air-bags'),
    __metadata("design:paramtypes", [air_bags_service_1.AirBagsService])
], AirBagsController);
//# sourceMappingURL=air_bags.controller.js.map