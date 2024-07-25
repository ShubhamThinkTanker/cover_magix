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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const categories_service_1 = require("./categories.service");
const commonResponse_1 = require("../../../Helper/commonResponse");
const categories_createValidation_1 = require("./Validation/categories.createValidation");
const class_validator_1 = require("class-validator");
const multer_1 = require("@nestjs/platform-express/multer");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const categories_schema_1 = require("./categories.schema");
const sequelize_1 = require("@nestjs/sequelize");
class UpdatePositionDto {
}
let CategoriesController = exports.CategoriesController = class CategoriesController {
    constructor(categoryModel, s3Service, categoryService) {
        this.categoryModel = categoryModel;
        this.s3Service = s3Service;
        this.categoryService = categoryService;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async categoriecreate(CreateCategory, req, res, category_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            if (!category_image || !category_image.originalname) {
                return new commonResponse_1.CustomErrorResponse(res, 400, 'No file provided or file missing originalname', 'File upload error');
            }
            const fileName = `${Date.now()}-${category_image.originalname}`;
            const errors = {};
            const categoryInput = new categories_createValidation_1.ValidateCategory();
            categoryInput.category_name = CreateCategory.category_name;
            categoryInput.include_store_menu = CreateCategory.include_store_menu;
            categoryInput.status = CreateCategory.status;
            categoryInput.description = CreateCategory.description;
            const validation_errors = await (0, class_validator_1.validate)(categoryInput);
            const findCategoryExist = await this.categoryService.categoryNameExist(CreateCategory);
            if (findCategoryExist) {
                errors['category_name'] = 'This Category name already exists';
            }
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.forEach((error) => {
                    errors[error.property] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            await this.s3Service.uploadFileToS3CategoryAndSubCategory(category_image, fileName);
            const createdData = await this.categoryService.createCategory(req.user, CreateCategory, fileName);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 Category Created Successfully!');
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
    async getAllCategoryList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let category_listing = await this.categoryService.allCategoryListing(req.body, req.user);
            if (category_listing) {
                return new commonResponse_1.Success(res, 200, category_listing, '🎉 All Categories Listed Successfully!');
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
            const CategoryId = req.params.id;
            if (!this.isValidMySQLId(CategoryId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Category id', 'Category id isnot valid');
            }
            const ListData = await this.categoryService.CategoriesById(req.user, id);
            if (!ListData) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Grommet not found', 'GrommetID doesnot found in database');
            }
            return new commonResponse_1.Success(res, 200, ListData, '🔍 Category Found Successfully!');
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updateCategoriesById(id, req, res, category_image) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const CategoryId = req.params.id;
            if (!this.isValidMySQLId(CategoryId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Category id', 'Category id is not valid');
            }
            const existingCategory = await this.categoryService.CategoriesById(req.user, CategoryId);
            if (!existingCategory) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Category not found', 'Category ID does not found in database');
            }
            let fileName = existingCategory.category_image;
            if (category_image) {
                fileName = `${Date.now()}-${category_image.originalname}`;
                await this.s3Service.uploadFileToS3CategoryAndSubCategory(category_image, fileName);
            }
            const updateData = await this.categoryService.updateCategories(req.user, id, req.body, fileName);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, '🎊 Category Updated Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, false, 'Something went wrong during update');
            }
        }
        catch (error) {
            console.log('Update Category Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async categorieDeleteById(id, req, res) {
        try {
            const CategoryId = req.params.id;
            if (!this.isValidMySQLId(CategoryId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Category id', 'Category id isnot valid');
            }
            const existingCategory = await this.categoryService.CategoriesById(req.user, CategoryId);
            if (!existingCategory) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Category not found', 'CategoryID doesnot found in database');
            }
            const data = await this.categoryService.deleteCategorie(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, '🗑️ Category Deleted Successfully!');
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
    async getAllCategoryListValueLabelWise(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let category_listing_VL = await this.categoryService.allCategoryListingVL(req.user);
            if (category_listing_VL) {
                return new commonResponse_1.Success(res, 200, category_listing_VL, '📋 All Categories Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, category_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllCategoryListValueLabelWiseWithStatus(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let category_listing_VL = await this.categoryService.allCategoryListingVLStatus(req.user);
            if (category_listing_VL) {
                return new commonResponse_1.Success(res, 200, category_listing_VL, '📋 All Categories Listed Successfully by Label and Value With Status!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, category_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllCategoryListValueLabelWiseWithSubCategories(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const { category_id } = req.body;
            if (!category_id) {
                return new commonResponse_1.CustomErrorResponse(res, 400, 'Missing category_id', 'Please provide a category_id in the request body');
            }
            let categoryWithSubcategories = await this.categoryService.getCategoryWithSubcategories(req.user, category_id);
            if (categoryWithSubcategories) {
                return new commonResponse_1.Success(res, 200, categoryWithSubcategories, '📋 Category with Subcategories Listed Successfully by Label and Value!');
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
    async getCategoryWiseSubcategoriesAndProducts(req, res) {
        try {
            let categoryWithSubcategories = await this.categoryService.getCategoryWiseSubcategoriesAndProducts();
            if (categoryWithSubcategories) {
                return new commonResponse_1.Success(res, 200, categoryWithSubcategories, '📋 Category with Subcategories Listed Successfully by Label and Value!');
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
    async getCategoryWiseSubcategoriesAndProductsById(req, res) {
        try {
            const { category_id } = req.body;
            if (!category_id) {
                return new commonResponse_1.CustomErrorResponse(res, 400, 'Missing category_id', 'Please provide a category_id in the request body');
            }
            let categoryWithSubcategories = await this.categoryService.getCategoryWiseSubcategoriesAndProductsByID(category_id);
            if (categoryWithSubcategories) {
                return new commonResponse_1.Success(res, 200, categoryWithSubcategories, '📋 Category with Subcategories Listed Successfully by Label and Value!');
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
    async getAllCategoryListValueLabelWiseWithProducts(req, res) {
        try {
            const { category_id } = req.body;
            if (!category_id) {
                return new commonResponse_1.CustomErrorResponse(res, 400, 'Missing category_id', 'Please provide a category_id in the request body');
            }
            let categoryWithProducts = await this.categoryService.getCategoryWiseProducts(category_id);
            if (categoryWithProducts) {
                return new commonResponse_1.Success(res, 200, categoryWithProducts, '📋 Category with Products Listed Successfully by Label and Value!');
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
            const bufferData = await this.categoryService.ExportExcel();
            return new commonResponse_1.Success(res, 200, bufferData, '📋 Category Excel Successfully Export!');
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getCategories(type) {
        const typeNum = Number(type);
        return this.categoryService.positionWiseListing(typeNum);
    }
    updatePositions(req, res) {
        this.categoryService.updateCategoryPositions(req.body);
        return new commonResponse_1.Success(res, 200, {}, '📋 Category updateed Successfully!');
    }
    async listingAllCategoriesForUserWesite(req, res) {
        try {
            var findAllCategories = await this.categoryService.AllCategoriesUserMenuBar();
            return new commonResponse_1.Success(res, 200, findAllCategories, '🎉 Categories Retrieved Successfully! 📋');
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
};
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('category_image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "categoriecreate", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getAllCategoryList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getByIdCategoriesList", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('category_image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "updateCategoriesById", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "categorieDeleteById", null);
__decorate([
    (0, common_1.Get)('list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getAllCategoryListValueLabelWise", null);
__decorate([
    (0, common_1.Get)('list_V_L_Status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getAllCategoryListValueLabelWiseWithStatus", null);
__decorate([
    (0, common_1.Post)('list_V_L_subcategory'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getAllCategoryListValueLabelWiseWithSubCategories", null);
__decorate([
    (0, common_1.Get)('list_V_L_All_categories'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategoryWiseSubcategoriesAndProducts", null);
__decorate([
    (0, common_1.Post)('list_V_L_categories_Products'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategoryWiseSubcategoriesAndProductsById", null);
__decorate([
    (0, common_1.Post)('list_V_L_Products'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getAllCategoryListValueLabelWiseWithProducts", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Get)('position/listing'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('update-positions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "updatePositions", null);
__decorate([
    (0, common_1.Get)('Listing-menu-user'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "listingAllCategoriesForUserWesite", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, common_1.Controller)('categories'),
    __param(0, (0, sequelize_1.InjectModel)(categories_schema_1.Categories)),
    __metadata("design:paramtypes", [Object, S3Bucket_1.S3Service,
        categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map