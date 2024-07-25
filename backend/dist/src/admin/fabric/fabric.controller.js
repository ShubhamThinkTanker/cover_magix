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
exports.FabricController = void 0;
const common_1 = require("@nestjs/common");
const commonResponse_1 = require("../../../Helper/commonResponse");
const class_validator_1 = require("class-validator");
const multer_1 = require("@nestjs/platform-express/multer");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const febric_createValidation_1 = require("./Validation/febric.createValidation");
const febricMaterial_createValidation_1 = require("./Validation/febricMaterial.createValidation");
const fabric_service_1 = require("./fabric.service");
const createFabric_dto_1 = require("./dto/createFabric.dto");
const createFabricMaterial_dto_1 = require("./dto/createFabricMaterial.dto");
const fabricMaterial_schema_1 = require("./fabricMaterial.schema");
const sequelize_1 = require("@nestjs/sequelize");
const imageConfigration_1 = require("../../../Helper/imageConfigration");
let FabricController = exports.FabricController = class FabricController {
    constructor(FabricsMaterialModel, s3Service, fabricService) {
        this.FabricsMaterialModel = FabricsMaterialModel;
        this.s3Service = s3Service;
        this.fabricService = fabricService;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async fabriccreate(CreateFabric, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const errors = {};
            const FabricInput = new febric_createValidation_1.ValidateFabric();
            FabricInput.fabric_name = CreateFabric.fabric_name;
            FabricInput.material = CreateFabric.material;
            FabricInput.ideal_for = CreateFabric.ideal_for;
            FabricInput.feature = CreateFabric.feature;
            FabricInput.weight = CreateFabric.weight;
            FabricInput.warranty = CreateFabric.warranty;
            const validation_errors = await (0, class_validator_1.validate)(FabricInput);
            const findFabricExist = await this.fabricService.FabricNameExist(CreateFabric);
            if (findFabricExist) {
                errors['Fabric_name'] = 'This Fabric name is already exist';
            }
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            console.log(CreateFabric, ':CreateFabric');
            const createdData = await this.fabricService.CreateFabric(req.user, CreateFabric);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 Fabric Created Successfully!');
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
    async fabricMaterialCreate(CreateFabricMaterial, req, res, fabric_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            var fileName = `${Date.now()}-${fabric_image.originalname}`;
            const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(fabric_image.buffer, 150, 150);
            const errors = {};
            const fabricMaterialInput = new febricMaterial_createValidation_1.ValidateFabricMaterial();
            fabricMaterialInput.color_name = CreateFabricMaterial.color_name;
            fabricMaterialInput.color = CreateFabricMaterial.color;
            fabricMaterialInput.color_suggestions = CreateFabricMaterial.color_suggestions;
            const validation_errors = await (0, class_validator_1.validate)(fabricMaterialInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            await this.s3Service.uploadFileToS3ForFabric({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
            const createdData = await this.fabricService.createFabricMaterial(req.user, CreateFabricMaterial, fileName);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 Fabric Material Created Successfully!');
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
    async getByIdFabricMaterialsList(fabric_id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const FabricMaterialId = req.params.fabric_id;
            if (!this.isValidMySQLId(FabricMaterialId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Fabric Material id', 'Fabric Materiala id is not valid');
            }
            const ListData = await this.fabricService.FabricsMaterialById(fabric_id);
            if (!ListData) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'FabricMaterial not found', 'FabricMaterialID does not found in database');
            }
            if (ListData) {
                return new commonResponse_1.Success(res, 200, ListData, '🔍 Fabric Material Found Successfully!');
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
    async getAllFabricMaterialsList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let fabricMaterial_listing = await this.fabricService.allFabricMaterialsFind(req.body, req.user);
            if (fabricMaterial_listing) {
                return new commonResponse_1.Success(res, 200, fabricMaterial_listing, '🎉 All Fabric Material Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, fabricMaterial_listing, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async fabricMaterialDeleteByID(id, req, res) {
        try {
            const FabricMaterialId = req.params.id;
            if (!this.isValidMySQLId(FabricMaterialId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Fabric_Material id', 'Fabric_Material id isnot valid');
            }
            const dataFindForImageDelete = await this.fabricService.FindfabricMaterial(id);
            await this.s3Service.deleteFabricImage(dataFindForImageDelete?.fabric_image);
            const data = await this.fabricService.deletefabricMaterial(req.user, id);
            if (!data) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Fabric_Material not found', 'Fabric_Material ID doesnot found in database');
            }
            return new commonResponse_1.Success(res, 200, {}, '🗑️ Fabric Material Deleted Successfully!');
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getByIdFabricsList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const FabricId = req.params.id;
            if (!this.isValidMySQLId(FabricId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Fabric id', 'Fabric id isnot valid');
            }
            const ListData = await this.fabricService.FabricById(id);
            if (!ListData) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Fabric not found', 'FabricID doesnot found in database');
            }
            if (ListData) {
                return new commonResponse_1.Success(res, 200, ListData, '🔍 Fabric Found Successfully!');
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
    async getAllFabricList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let category_listing = await this.fabricService.allFabricFind(req.body, req.user);
            if (category_listing) {
                return new commonResponse_1.Success(res, 200, category_listing, '🎉 All Fabric Listed Successfully!');
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
    async fabricDeleteById(id, req, res) {
        try {
            const FabricId = req.params.id;
            if (!this.isValidMySQLId(FabricId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Fabric id', 'Fabric id isnot valid');
            }
            const existingFabric = await this.fabricService.FabricById(id);
            if (!existingFabric) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Fabric not found', 'FabricID doesnot found in database');
            }
            const data = await this.fabricService.deleteFabric(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, '🗑️ Fabric Deleted Successfully!');
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
    async getAllFabricListValueLabelWise(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let fabric_listing_VL = await this.fabricService.allFabricListingVL(req.user);
            if (fabric_listing_VL) {
                return new commonResponse_1.Success(res, 200, fabric_listing_VL, '📋 All Fabric Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, fabric_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllFabricMaterialsListValueLabelWise(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let fabric_materials_listing_VL = await this.fabricService.allFabricMaterialsListingVL(req.user);
            if (fabric_materials_listing_VL) {
                return new commonResponse_1.Success(res, 200, fabric_materials_listing_VL, '📋 All Fabric Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, fabric_materials_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updateFabricById(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const FabricId = req.params.id;
            if (!this.isValidMySQLId(FabricId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Fabric id', 'Fabric id isnot valid');
            }
            const existingFabric = await this.fabricService.FabricById(FabricId);
            if (!existingFabric) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Fabric not found', 'FabricID doesnot found in database');
            }
            const errors = {};
            const FabricInput = new febric_createValidation_1.ValidateFabric();
            FabricInput.fabric_name = req.body.fabric_name;
            FabricInput.material = req.body.material;
            FabricInput.ideal_for = req.body.ideal_for;
            FabricInput.feature = req.body.feature;
            FabricInput.warranty = req.body.warranty;
            FabricInput.weight = req.body.weight;
            FabricInput.water_proof = req.body.water_proof;
            FabricInput.uv_resistant = req.body.uv_resistant;
            FabricInput.fabric_type = req.body.fabric_type;
            const validation_errors = await (0, class_validator_1.validate)(FabricInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            const updateData = await this.fabricService.updateFabric(req.user, id, req.body);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, req.body, '🎊 Fabric Updated Successfully!');
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
    async updateFabricMaterialById(id, req, res, fabric_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const FabricMaterialId = req.params.id;
            if (!this.isValidMySQLId(FabricMaterialId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid FabricMaterial id', 'FabricMaterial id isnot valid');
            }
            const existingFabricMaterial = await this.FabricsMaterialModel.findOne({ where: { id, deleted_at: null } });
            if (!existingFabricMaterial) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'FabricMaterial not found', 'FabricMaterialID doesnot found in database');
            }
            const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(fabric_image.buffer, 150, 150);
            const errors = {};
            const fabricMaterialInput = new febricMaterial_createValidation_1.ValidateFabricMaterial();
            fabricMaterialInput.color_name = req.body.color_name;
            fabricMaterialInput.color = req.body.color;
            fabricMaterialInput.color_suggestions = req.body.color_suggestions;
            const validation_errors = await (0, class_validator_1.validate)(fabricMaterialInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Validation Error', errors);
            }
            if (fabric_image) {
                await this.s3Service.deleteFabricMaterialImage(existingFabricMaterial.fabric_image);
                var fileName = `${Date.now()}-${fabric_image.originalname}`;
                await this.s3Service.uploadFileToS3ForFabric({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
            }
            const updateData = await this.fabricService.updateFabricMaterial(req.user, FabricMaterialId, req.body, fileName);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, "✨ Fabric Material Updated Successfully!");
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
            const bufferData = await this.fabricService.ExportExcel();
            return new commonResponse_1.Success(res, 200, bufferData, '📋 Fabric Excel Successfully Export!');
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
    __metadata("design:paramtypes", [createFabric_dto_1.CreateFabricDto, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "fabriccreate", null);
__decorate([
    (0, common_1.Post)('fabric_material'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('fabric_image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createFabricMaterial_dto_1.CreateFabricMaterialDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "fabricMaterialCreate", null);
__decorate([
    (0, common_1.Get)('fabric_material/list/:fabric_id'),
    __param(0, (0, common_1.Param)('fabric_id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "getByIdFabricMaterialsList", null);
__decorate([
    (0, common_1.Post)('fabric_material/list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "getAllFabricMaterialsList", null);
__decorate([
    (0, common_1.Post)('fabric_material/delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "fabricMaterialDeleteByID", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "getByIdFabricsList", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "getAllFabricList", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "fabricDeleteById", null);
__decorate([
    (0, common_1.Get)('list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "getAllFabricListValueLabelWise", null);
__decorate([
    (0, common_1.Get)('fabric_material/list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "getAllFabricMaterialsListValueLabelWise", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "updateFabricById", null);
__decorate([
    (0, common_1.Post)('fabric_material/update/:id'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('fabric_image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "updateFabricMaterialById", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FabricController.prototype, "exportExcel", null);
exports.FabricController = FabricController = __decorate([
    (0, common_1.Controller)('fabric'),
    __param(0, (0, sequelize_1.InjectModel)(fabricMaterial_schema_1.FabricsMaterial)),
    __metadata("design:paramtypes", [Object, S3Bucket_1.S3Service,
        fabric_service_1.FabricService])
], FabricController);
//# sourceMappingURL=fabric.controller.js.map