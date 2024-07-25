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
exports.PromoCodeController = void 0;
const common_1 = require("@nestjs/common");
const promo_code_service_1 = require("./promo_code.service");
const promo_code_dto_1 = require("./dto/promo_code.dto");
const commonResponse_1 = require("../../../Helper/commonResponse");
const product_schema_1 = require("../product/product.schema");
const sequelize_1 = require("sequelize");
const sequelize_2 = require("@nestjs/sequelize");
const class_validator_1 = require("class-validator");
const promocode_validation_1 = require("./validation/promocode.validation");
let PromoCodeController = exports.PromoCodeController = class PromoCodeController {
    constructor(promoService, productModel) {
        this.promoService = promoService;
        this.productModel = productModel;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async promoCreate(CreatePromo, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            var findSameNamePromo = await this.promoService.findNamePromo(req.body.code);
            if (findSameNamePromo) {
                return new commonResponse_1.CustomErrorResponse(res, 400, 'This promo code already exists. Please use a different name.', 'Something went wrong during creation');
            }
            const promoType = req.body.promo_type;
            const itemIds = req.body.itemId;
            if (promoType === 'cat' || promoType === 'sub_cat') {
                const field = promoType === 'cat' ? 'category_id' : 'sub_category_id';
                const findProduct = await this.productModel.findAll({
                    where: {
                        [field]: {
                            [sequelize_1.Op.in]: itemIds,
                        },
                    },
                    attributes: ['id'],
                    raw: true,
                });
                const productIds = findProduct.map((product) => product.id);
                req.body.productIds = Array.from(new Set(productIds));
            }
            else if (promoType === 'pro') {
                req.body.productIds = itemIds;
            }
            const createdData = await this.promoService.createPromo(req.user, req.body);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🌟 Your Promo Code Offer has been successfully Genrate! 🌟');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, createdData, 'Something went wrong during creation');
            }
        }
        catch (error) {
            console.log(error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async headerPromoGet(req, res) {
        try {
            console.log(':header_promo');
            var findHeaderPromoCode = await this.promoService.findHeaderPromo();
            if (findHeaderPromoCode) {
                return new commonResponse_1.Success(res, 200, findHeaderPromoCode, '🌟 Your Header Promo Code Get! 🌟');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, findHeaderPromoCode, 'Something went wrong during creation');
            }
        }
        catch (error) {
            console.log(error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllPromoCodeList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let promocode_listing = await this.promoService.allPromoCodesListing(req.body, req.user);
            if (promocode_listing) {
                return new commonResponse_1.Success(res, 200, promocode_listing, '🎉 All PromoCodes Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, promocode_listing, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getByIdPromoCodeList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const PromoCodeId = req.params.id;
            if (!this.isValidMySQLId(PromoCodeId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid PromoCode id', 'PromoCode id isnot valid');
            }
            const ListData = await this.promoService.PromocodeById(req.user, id);
            if (!ListData) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'PromoCode not found', 'PromoCodeID doesnot found in database');
            }
            return new commonResponse_1.Success(res, 200, ListData, '🔍 PromoCode Found Successfully!');
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updatePromoCodeId(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const PromoCodeId = req.params.id;
            if (!this.isValidMySQLId(PromoCodeId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Promo Code id', 'promo Code id isnot valid');
            }
            const existingPromoCode = await this.promoService.PromocodeById(req.user, PromoCodeId);
            if (!existingPromoCode) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'PromoCode not found', 'Promo code ID doesnot found in database');
            }
            const errors = {};
            const productInput = new promocode_validation_1.ValidatePromoCode();
            productInput.promo_type = req.body.promo_type;
            productInput.code = req.body.code;
            productInput.header_Promo = req.body.header_Promo;
            productInput.description = req.body.description;
            productInput.max_user = req.body.max_user;
            productInput.status = req.body.status;
            productInput.end_date = req.body.end_date;
            productInput.start_date = req.body.start_date;
            productInput.discount_per = req.body.discount_per;
            const validation_errors = await (0, class_validator_1.validate)(productInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            const updateData = await this.promoService.updatePromoCode(req.user, id, req.body);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, '🎊 Promo Code Updated Successfully!');
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
    async PromoDeleteById(id, req, res) {
        try {
            const PromoId = req.params.id;
            if (!this.isValidMySQLId(PromoId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Promo id', 'Promo id isnot valid');
            }
            const existingPromo = await this.promoService.deletePromoById(req.user, PromoId);
            if (!existingPromo) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Promo code not found', 'Promo code doesnot found in database');
            }
            const data = await this.promoService.deletePromoById(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, '🗑️ Promo Code Deleted Successfully!');
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
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promo_code_dto_1.CreatePromoDto, Object, Response]),
    __metadata("design:returntype", Promise)
], PromoCodeController.prototype, "promoCreate", null);
__decorate([
    (0, common_1.Get)('header_promo'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], PromoCodeController.prototype, "headerPromoGet", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], PromoCodeController.prototype, "getAllPromoCodeList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], PromoCodeController.prototype, "getByIdPromoCodeList", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], PromoCodeController.prototype, "updatePromoCodeId", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], PromoCodeController.prototype, "PromoDeleteById", null);
exports.PromoCodeController = PromoCodeController = __decorate([
    (0, common_1.Controller)('promo_code'),
    __param(1, (0, sequelize_2.InjectModel)(product_schema_1.Products)),
    __metadata("design:paramtypes", [promo_code_service_1.PromoCodeService, Object])
], PromoCodeController);
//# sourceMappingURL=promo_code.controller.js.map