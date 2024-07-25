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
exports.SubCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const sub_categories_schema_1 = require("./sub_categories.schema");
const categories_schema_1 = require("../categories/categories.schema");
const product_schema_1 = require("../product/product.schema");
const productImage_schema_1 = require("../product/productImage.schema");
const ExcelJS = require("exceljs");
const dateFormat_1 = require("../../../Helper/dateFormat");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let SubCategoriesService = exports.SubCategoriesService = class SubCategoriesService {
    constructor(subcategoryModel, ProductModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.subcategoryModel = subcategoryModel;
        this.ProductModel = ProductModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async SubCategoryNameExist(reqBody) {
        try {
            const categories = await this.subcategoryModel.findOne({
                where: { sub_category_name: reqBody.sub_category_name, deleted_at: null },
                raw: true,
                nest: true,
            });
            return categories;
        }
        catch (error) {
            throw error;
        }
    }
    async createCategory(reqUser, createSubCategoryDto, fileName) {
        try {
            const { category_id, sub_category_name, sub_catetgory_slug_url, description } = createSubCategoryDto;
            const newSubCategory = await this.subcategoryModel.create({
                category_id: category_id,
                sub_category_name: sub_category_name,
                sub_catetgory_slug_url: sub_catetgory_slug_url,
                sub_category_image: fileName,
                description: description,
                created_at: new Date()
            });
            return newSubCategory;
        }
        catch (error) {
            console.error('Error creating category:', error);
            throw new common_1.BadRequestException('Could not create category.');
        }
    }
    async allSubCategoryListing(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'sub_category_name';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
                for (const key in reqbody.filter_value) {
                    if (reqbody.filter_value.hasOwnProperty(key)) {
                        const value = reqbody.filter_value[key];
                        if (key === 'sub_category_name' || key === 'category_id') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
                        }
                    }
                }
            }
            let categoryFilter = {};
            if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
                if (reqbody.filter_value.category_name) {
                    categoryFilter = {
                        category_name: {
                            [sequelize_2.Op.like]: `%${reqbody.filter_value.category_name}%`
                        }
                    };
                }
            }
            const { count, rows } = await sub_categories_schema_1.Sub_Categories.findAndCountAll({
                where: whereClause,
                include: [
                    { model: categories_schema_1.Categories,
                        attributes: ['category_name'],
                        where: categoryFilter
                    }
                ],
                attributes: ['id', 'category_id', 'sub_category_name', 'sub_catetgory_slug_url', 'sub_category_image', 'description', 'created_at', 'updated_at'],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true,
            });
            const modifiedRows = rows.map(row => ({
                ...row,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at)),
                sub_category_image: `${process.env.CategorySubcategoryS3Url}/${row.sub_category_image}`
            }));
            return {
                totalRecords: count,
                Sub_Categorie_listing: modifiedRows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async SubCategoriesById(reqUser, id) {
        try {
            const data = await this.subcategoryModel.findOne({ where: { id, deleted_at: null }, attributes: ['id', 'category_id', 'sub_category_name', 'sub_catetgory_slug_url', 'created_at', 'updated_at'] });
            if (!data) {
                throw new Error('Subcategory not found');
            }
            const formattedData = {
                ...data.get(),
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(data.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(data.updated_at))
            };
            return formattedData;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteSubCategorie(reqUser, id) {
        try {
            const Product = await this.ProductModel.update({ deleted_at: new Date() }, {
                where: { category_id: id },
                returning: true,
            });
            const Subcategory = await this.subcategoryModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true
            });
            return Subcategory;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateSubCategories(reqUser, id, reqBody, file) {
        try {
            const updatedSubCategory = await this.subcategoryModel.update({
                category_id: reqBody.category_id,
                sub_category_name: reqBody.sub_category_name?.trim(),
                sub_catetgory_slug_url: reqBody.sub_catetgory_slug_url,
                sub_category_image: file,
                updated_at: new Date()
            }, {
                returning: true,
                where: { id: id, deleted_at: null }
            });
            return updatedSubCategory;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allSubCategoriesListingVL(reqUser) {
        try {
            var data = await sub_categories_schema_1.Sub_Categories.findAll({
                where: { deleted_at: null },
                attributes: ['id', 'sub_category_name'],
                order: [['sub_category_name', 'ASC']],
                raw: true,
                nest: true,
            });
            const valueLabelPairs = data?.map(subcategory => {
                return { value: subcategory?.id, label: subcategory?.sub_category_name };
            });
            return valueLabelPairs;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async SubCategoriesListingVLByID(reqUser, id) {
        try {
            var data = await sub_categories_schema_1.Sub_Categories.findAll({
                where: { id: id, deleted_at: null },
                attributes: ['id', 'sub_category_name'],
                order: [['sub_category_name', 'ASC']],
                raw: true,
                nest: true,
            });
            const valueLabelPairs = data?.map(subcategory => {
                return { value: subcategory?.id, label: subcategory?.sub_category_name };
            });
            return valueLabelPairs;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async getSubcategoryWiseProducts(subCategoryId) {
        try {
            const products = await product_schema_1.Products.findAll({
                where: { sub_category_id: subCategoryId, deleted_at: null },
                attributes: ['id', 'product_name', 'product_slug_url', 'product_price'],
                include: [{ model: productImage_schema_1.ProductsImage, attributes: ['product_image'] }],
                raw: true,
                nest: true,
            });
            const product = products.map(product => ({
                value: product.id,
                label: {
                    product: product?.product_name,
                    product_slug: product?.product_slug_url,
                    price: product?.product_price,
                    images: product?.images
                }
            }));
            return product;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async ExportExcel() {
        try {
            const SubCategoryData = await this.subcategoryModel.findAll({
                where: {
                    deleted_at: null
                },
            });
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('SubCategories');
            const headers = [
                { header: 'No', width: 20 },
                { header: 'Category ID', key: 'category_id', width: 30 },
                { header: 'Sub Category Name', key: 'sub_category_name', width: 20 },
                { header: 'Sub Category Slug URL', key: 'sub_catetgory_slug_url', width: 20 },
                { header: 'Date', key: 'created_at', width: 20 },
                { header: 'Date', key: 'updated_at', width: 20 },
            ];
            worksheet.columns = headers;
            const exportData = SubCategoryData.map((filedata, index) => ({
                id: index + 1,
                category_id: filedata.category_id,
                sub_category_name: filedata.sub_category_name,
                sub_catetgory_slug_url: filedata.sub_catetgory_slug_url,
                created_at: filedata.created_at,
                updated_at: filedata.updated_at,
            }));
            exportData.forEach(data => {
                worksheet.addRow([
                    data.id,
                    data.category_id,
                    data.sub_category_name,
                    data.sub_catetgory_slug_url,
                    data.created_at,
                    data.updated_at
                ]);
            });
            const Buffer = await workbook.xlsx.writeBuffer();
            console.log("Excel file written successfully.");
            return Buffer;
        }
        catch (error) {
            throw error;
        }
    }
};
__decorate([
    activityLogger_1.ActivityLogger.createLog('SubCategory', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesService.prototype, "createCategory", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('SubCategory', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesService.prototype, "deleteSubCategorie", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('SubCategory', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SubCategoriesService.prototype, "updateSubCategories", null);
exports.SubCategoriesService = SubCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(sub_categories_schema_1.Sub_Categories)),
    __param(1, (0, sequelize_1.InjectModel)(product_schema_1.Products)),
    __param(2, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], SubCategoriesService);
//# sourceMappingURL=sub_categories.service.js.map