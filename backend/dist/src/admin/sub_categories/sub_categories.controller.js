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
exports.SubCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const sub_categories_service_1 = require("./sub_categories.service");
const commonResponse_1 = require("../../../Helper/commonResponse");
const sub_categories_createValidation_1 = require("./Validation/sub_categories.createValidation");
const class_validator_1 = require("class-validator");
const multer_1 = require("@nestjs/platform-express/multer");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
let SubCategoriesController = exports.SubCategoriesController = class SubCategoriesController {
    constructor(s3Service, subCategoryService) {
        this.s3Service = s3Service;
        this.subCategoryService = subCategoryService;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async Subcategoriecreate(CreateSubCategory, req, res, sub_category_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            if (!sub_category_image || !sub_category_image.originalname) {
                return new commonResponse_1.CustomErrorResponse(res, 400, 'No file provided or file missing originalname', 'File upload error');
            }
            const fileName = `${Date.now()}-${sub_category_image.originalname}`;
            const errors = {};
            const subcategoryInput = new sub_categories_createValidation_1.ValidateSubCategory();
            subcategoryInput.sub_category_name = CreateSubCategory.sub_category_name;
            subcategoryInput.description = CreateSubCategory.description;
            const validation_errors = await (0, class_validator_1.validate)(subcategoryInput);
            const findSubCategoryExist = await this.subCategoryService.SubCategoryNameExist(subcategoryInput);
            if (findSubCategoryExist) {
                errors['sub_category_name'] = 'This Sub Category name is already exist';
            }
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            await this.s3Service.uploadFileToS3CategoryAndSubCategory(sub_category_image, fileName);
            const createdData = await this.subCategoryService.createCategory(req.user, CreateSubCategory, fileName);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 Subcategory Created Successfully!');
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
    async getAllSubCategoryList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let category_listing = await this.subCategoryService.allSubCategoryListing(req.body, req.user);
            if (category_listing) {
                return new commonResponse_1.Success(res, 200, category_listing, '🎉 All Subcategories Listed Successfully!');
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
    async getByIdSubCategoriesList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const subCategoryID = req.params.id;
            if (!this.isValidMySQLId(subCategoryID)) {
                return res.status(404).json({ message: 'Enter valid SubCategory id' });
            }
            const ListData = await this.subCategoryService.SubCategoriesById(req.user, subCategoryID);
            if (!ListData) {
                return res.status(404).json({ message: 'Sub Category not found' });
            }
            if (ListData) {
                return new commonResponse_1.Success(res, 200, ListData, '🔍 Subcategory Found Successfully!');
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
    async SubcategorieDeleteById(id, req, res) {
        try {
            const subCategoryID = req.params.id;
            if (!this.isValidMySQLId(subCategoryID)) {
                return res.status(404).json({ message: 'Enter valid SubCategory id' });
            }
            const existingUser = await this.subCategoryService.SubCategoriesById(req.user, subCategoryID);
            if (!existingUser) {
                return res.status(404).json({ message: 'Sub Category not found' });
            }
            const data = await this.subCategoryService.deleteSubCategorie(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, "🗑️ Subcategory Deleted Successfully!");
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
    async updateCategoriesById(id, req, res, sub_category_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const errors = {};
            const categoryInput = new sub_categories_createValidation_1.ValidateSubCategory();
            categoryInput.sub_category_name = req.body.sub_category_name;
            const validation_errors = await (0, class_validator_1.validate)(categoryInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            const subCategoryID = req.params.id;
            if (!this.isValidMySQLId(subCategoryID)) {
                return res.status(404).json({ message: 'Enter valid SubCategory id' });
            }
            const existingUser = await this.subCategoryService.SubCategoriesById(req.user, subCategoryID);
            if (!existingUser) {
                return res.status(404).json({ message: 'Sub Category not found' });
            }
            var fileName = `${Date.now()}-${sub_category_image.originalname}`;
            await this.s3Service.uploadFileToS3CategoryAndSubCategory(sub_category_image, fileName);
            const updateData = await this.subCategoryService.updateSubCategories(req.user, id, req.body, fileName);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, "🎊 Subcategory Updated Successfully!");
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
    async getAllSubcategoryListValueLabelWise(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let subcategories_listing_VL = await this.subCategoryService.allSubCategoriesListingVL(req.user);
            if (subcategories_listing_VL) {
                return new commonResponse_1.Success(res, 200, subcategories_listing_VL, '📋 All Subcategories Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, subcategories_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getSubcategoryListValueLabelWiseByID(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let subcategories_listing_VL = await this.subCategoryService.SubCategoriesListingVLByID(req.user, id);
            if (subcategories_listing_VL) {
                return new commonResponse_1.Success(res, 200, subcategories_listing_VL, '📋 Subcategory Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, subcategories_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllSubCategoryListValueLabelWiseWithProducts(req, res) {
        try {
            const { sub_category_id } = req.body;
            if (!sub_category_id) {
                return new commonResponse_1.CustomErrorResponse(res, 400, 'Missing sub category id', 'Please provide a sub category id in the request body');
            }
            let subCategoryWithProducts = await this.subCategoryService.getSubcategoryWiseProducts(sub_category_id);
            if (subCategoryWithProducts) {
                return new commonResponse_1.Success(res, 200, subCategoryWithProducts, '📋 Sub Category with Products Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Internal Server Error', 'Something went wrong in fetching category with subcategories');
            }
        }
        catch (error) {
            console.log('Controller Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async exportExcel(res, req) {
        try {
            const bufferData = await this.subCategoryService.ExportExcel();
            return new commonResponse_1.Success(res, 200, bufferData, '📋 SubCategory Excel Successfully Export!');
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
};
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('sub_category_image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "Subcategoriecreate", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "getAllSubCategoryList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "getByIdSubCategoriesList", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "SubcategorieDeleteById", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('sub_category_image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "updateCategoriesById", null);
__decorate([
    (0, common_1.Get)('list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "getAllSubcategoryListValueLabelWise", null);
__decorate([
    (0, common_1.Get)('list_V_L_ByID/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "getSubcategoryListValueLabelWiseByID", null);
__decorate([
    (0, common_1.Post)('list_V_L_SubCategory_Products'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "getAllSubCategoryListValueLabelWiseWithProducts", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "exportExcel", null);
exports.SubCategoriesController = SubCategoriesController = __decorate([
    (0, common_1.Controller)('sub-categories'),
    __metadata("design:paramtypes", [S3Bucket_1.S3Service,
        sub_categories_service_1.SubCategoriesService])
], SubCategoriesController);
//# sourceMappingURL=sub_categories.controller.js.map