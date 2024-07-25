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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const categories_schema_1 = require("./categories.schema");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const sub_categories_schema_1 = require("../sub_categories/sub_categories.schema");
const product_schema_1 = require("../product/product.schema");
const productImage_schema_1 = require("../product/productImage.schema");
const ExcelJS = require("exceljs");
const dateFormat_1 = require("../../../Helper/dateFormat");
const activityLogger_1 = require("../../../Helper/activityLogger");
class UpdatePositionDto {
}
let CategoriesService = exports.CategoriesService = class CategoriesService {
    constructor(categoryModel, SubCategoryModel, ProductModel) {
        this.categoryModel = categoryModel;
        this.SubCategoryModel = SubCategoryModel;
        this.ProductModel = ProductModel;
    }
    async createCategory(reqUser, CreateCategory, fileName) {
        const { category_name, status, include_store_menu, category_slug_url, description } = CreateCategory;
        let position = include_store_menu === '0' ? 0 : 1;
        if (include_store_menu === '0') {
            const storeMenuCategories = await this.categoryModel.findAll({
                where: {
                    include_store_menu: 0,
                },
                order: [['Position', 'DESC']],
                limit: 1,
                attributes: ['Position'],
            });
            if (storeMenuCategories.length > 0) {
                position = storeMenuCategories[0].Position + 1;
            }
        }
        return this.categoryModel.create({
            category_name,
            category_slug_url,
            category_image: fileName,
            description,
            status,
            include_store_menu,
            Position: position,
            created_at: new Date(),
        });
    }
    async categoryNameExist(reqBody) {
        try {
            const categories = await this.categoryModel.findOne({
                where: { category_name: reqBody.category_name, deleted_at: null },
                raw: true,
                nest: true,
            });
            return categories;
        }
        catch (error) {
            throw error;
        }
    }
    async allCategoryListing(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'category_name';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let type = reqbody.type;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
                for (const key in reqbody.filter_value) {
                    if (reqbody.filter_value.hasOwnProperty(key)) {
                        const value = reqbody.filter_value[key];
                        if (key === 'category_name' ||
                            key === 'status' ||
                            key === 'include_store_menu' ||
                            key === 'position' ||
                            key === 'created_at' ||
                            key === 'updated_at') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
                        }
                    }
                }
            }
            if (type === 2) {
                whereClause.include_store_menu = 0;
                order = [['Position', 'ASC']];
            }
            const { count, rows } = await this.categoryModel.findAndCountAll({
                where: whereClause,
                attributes: [
                    'id',
                    'category_name',
                    'status',
                    'include_store_menu',
                    'category_image',
                    'description',
                    'position',
                    'category_slug_url',
                    'created_at',
                    'updated_at',
                ],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true,
            });
            const modifiedRows = rows.map((row) => ({
                ...row,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at)),
                category_image: `${process.env.CategorySubcategoryS3Url}/${row.category_image}`,
            }));
            return {
                totalRecords: count,
                Category_listing: modifiedRows,
            };
        }
        catch (error) {
            console.log('Error:', error);
            throw error;
        }
    }
    async CategoriesById(reqUser, id) {
        try {
            const data = await this.categoryModel.findOne({
                where: { id, deleted_at: null },
            });
            if (!data) {
                throw new Error('Category not found');
            }
            const formattedData = {
                ...data.get(),
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(data.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(data.updated_at)),
                category_image: `${process.env.CategorySubcategoryS3Url}/${data.category_image}`,
            };
            return formattedData;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateCategories(reqUser, id, reqBody, file) {
        try {
            const updatedCategory = await this.categoryModel.update({
                category_name: reqBody.category_name?.trim(),
                category_slug_url: reqBody.category_slug_url,
                status: reqBody.status,
                category_image: file,
                Position: reqBody.Position,
                description: reqBody.description,
                include_store_menu: reqBody.include_store_menu,
                updated_at: new Date(),
            }, {
                returning: true,
                where: { id: id, deleted_at: null },
            });
            return updatedCategory;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteCategorie(reqUser, id) {
        try {
            const Product = await this.ProductModel.update({ deleted_at: new Date() }, {
                where: { category_id: id },
                returning: true,
            });
            const subcategory = await this.SubCategoryModel.update({ deleted_at: new Date() }, {
                where: { category_id: id },
                returning: true,
            });
            const category = await this.categoryModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            return category;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allCategoryListingVL(reqUser) {
        try {
            var data = await categories_schema_1.Categories.findAll({
                where: { deleted_at: null },
                attributes: ['id', 'category_name'],
                order: [['category_name', 'ASC']],
                raw: true,
                nest: true,
            });
            const valueLabelPairs = data?.map((category) => {
                return { value: category?.id, label: category?.category_name };
            });
            return valueLabelPairs;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async allCategoryListingVLStatus(reqUser) {
        try {
            var data = await categories_schema_1.Categories.findAll({
                where: { deleted_at: null, status: 'yes' },
                attributes: ['category_slug_url', 'category_name'],
                order: [['category_name', 'ASC']],
                raw: true,
                nest: true,
            });
            const valueLabelPairs = data?.map((category) => {
                return {
                    value: category?.category_slug_url,
                    label: category?.category_name,
                };
            });
            return valueLabelPairs;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async getCategoryWithSubcategories(reqUser, categoryId) {
        try {
            const subcategories = await sub_categories_schema_1.Sub_Categories.findAll({
                where: { category_id: categoryId, deleted_at: null },
                attributes: ['id', 'sub_category_name'],
                order: [['sub_category_name', 'ASC']],
                raw: true,
                nest: true,
            });
            const subCategory = subcategories.map((subcategory) => ({
                value: subcategory.id,
                label: subcategory.sub_category_name,
            }));
            return subCategory;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async getCategoryWiseSubcategoriesAndProducts() {
        try {
            const categories = await categories_schema_1.Categories.findAll({
                where: { deleted_at: null },
                attributes: ['id', 'Position', 'category_name', 'category_slug_url'],
                order: [['category_name', 'ASC']],
                raw: true,
                nest: true,
            });
            const subcategories = await sub_categories_schema_1.Sub_Categories.findAll({
                where: { deleted_at: null },
                attributes: [
                    'id',
                    'category_id',
                    'sub_category_name',
                    'sub_catetgory_slug_url',
                ],
                raw: true,
                nest: true,
            });
            const products = await product_schema_1.Products.findAll({
                where: { deleted_at: null },
                attributes: [
                    'id',
                    'sub_category_id',
                    'product_name',
                    'product_slug_url',
                ],
                raw: true,
                nest: true,
            });
            const subcategoriesByCategory = subcategories.reduce((acc, subcategory) => {
                const categoryId = subcategory.category_id;
                if (!acc[categoryId]) {
                    acc[categoryId] = [];
                }
                acc[categoryId].push(subcategory);
                return acc;
            }, {});
            const productsBySubcategory = products.reduce((acc, product) => {
                const subcategoryId = product.sub_category_id;
                if (!acc[subcategoryId]) {
                    acc[subcategoryId] = [];
                }
                acc[subcategoryId].push(product);
                return acc;
            }, {});
            const allCategoryListing = categories.map((category) => {
                const subcategories = subcategoriesByCategory[category.id] || [];
                const subcategoriesWithProducts = subcategories.map((subcategory) => {
                    const products = productsBySubcategory[subcategory.id] || [];
                    return {
                        subcategory_slug: {
                            value: subcategory.sub_category_name,
                            label: subcategory.sub_catetgory_slug_url,
                        },
                        products: products.map((product) => ({
                            value: product.product_name,
                            label: product.product_slug_url,
                        })),
                    };
                });
                return {
                    category_slug: {
                        position: category.Position,
                        value: category.category_name,
                        label: category.category_slug_url,
                    },
                    sub_category: subcategoriesWithProducts,
                };
            });
            return { all_category: categories };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async getCategoryWiseSubcategoriesAndProductsByID(categoryId) {
        try {
            const [categories, subcategories, products] = await Promise.all([
                categories_schema_1.Categories.findAll({
                    where: { id: categoryId, deleted_at: null },
                    attributes: ['id', 'Position', 'category_name', 'category_slug_url'],
                    raw: true,
                    nest: true,
                }),
                sub_categories_schema_1.Sub_Categories.findAll({
                    where: { category_id: categoryId, deleted_at: null },
                    attributes: [
                        'id',
                        'category_id',
                        'sub_category_name',
                        'sub_catetgory_slug_url',
                    ],
                    raw: true,
                    nest: true,
                }),
                product_schema_1.Products.findAll({
                    where: { deleted_at: null },
                    attributes: [
                        'id',
                        'sub_category_id',
                        'product_name',
                        'product_slug_url',
                    ],
                    raw: true,
                    nest: true,
                }),
            ]);
            const productsBySubcategory = products.reduce((acc, product) => {
                const subcategoryId = product.sub_category_id;
                if (!acc[subcategoryId]) {
                    acc[subcategoryId] = [];
                }
                acc[subcategoryId].push(product);
                return acc;
            }, {});
            const subcategoriesWithProducts = subcategories.map((subcategory) => {
                const products = productsBySubcategory[subcategory.id] || [];
                return {
                    subcategory_slug: {
                        value: subcategory.sub_category_name,
                        label: subcategory.sub_catetgory_slug_url,
                    },
                    products: products.map((product) => ({
                        value: product.product_name,
                        label: product.product_slug_url,
                    })),
                };
            });
            const allCategoryListing = categories.map((category) => ({
                category_slug: {
                    position: category.Position,
                    value: category.category_name,
                    label: category.category_slug_url,
                },
                sub_category: subcategoriesWithProducts,
            }));
            return { all_category: allCategoryListing };
        }
        catch (error) {
            console.error('Error fetching category data:', error);
            throw new Error('Error fetching category data');
        }
    }
    async getCategoryWiseProducts(categoryId) {
        try {
            const products = await product_schema_1.Products.findAll({
                where: { category_id: categoryId, deleted_at: null },
                attributes: [
                    'id',
                    'product_name',
                    'product_slug_url',
                    'product_price',
                    'created_at',
                    'updated_at',
                ],
                include: [{ model: productImage_schema_1.ProductsImage, attributes: ['product_image'] }],
                raw: true,
                nest: true,
            });
            const product = products.map((product) => ({
                value: product.id,
                label: {
                    product: product.product_name,
                    product_slug: product.product_slug_url,
                    price: product?.product_price,
                    images: product?.images,
                },
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
            const CategoryData = await this.categoryModel.findAll({
                where: {
                    deleted_at: null,
                },
            });
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Categories');
            const headers = [
                { header: 'No', width: 20 },
                { header: 'Category Name', key: 'category_name', width: 20 },
                { header: 'Category Slug URL', key: 'category_slug_url', width: 20 },
                { header: 'Status', key: 'status', width: 30 },
                { header: 'Include Store Menu', key: 'include_store_menu', width: 30 },
                { header: 'Position', key: 'Position', width: 30 },
                { header: 'Date', key: 'created_at', width: 20 },
                { header: 'Date', key: 'updated_at', width: 20 },
            ];
            worksheet.columns = headers;
            const exportData = CategoryData.map((filedata, index) => ({
                id: index + 1,
                category_name: filedata.category_name,
                category_slug_url: filedata.category_slug_url,
                status: filedata.status,
                include_store_menu: filedata.include_store_menu,
                Position: filedata.Position,
                created_at: filedata.created_at,
                updated_at: filedata.updated_at,
            }));
            exportData.forEach((data) => {
                worksheet.addRow([
                    data.id,
                    data.category_name,
                    data.category_slug_url,
                    data.status,
                    data.include_store_menu,
                    data.Position,
                    data.created_at,
                    data.updated_at,
                ]);
            });
            const Buffer = await workbook.xlsx.writeBuffer();
            console.log('Excel file written successfully.');
            return Buffer;
        }
        catch (error) {
            throw error;
        }
    }
    async positionWiseListing(type) {
        try {
            let categoryData;
            if (type === 2) {
                categoryData = await this.categoryModel.findAll({
                    where: {
                        include_store_menu: 1,
                    },
                    order: [['Position', 'ASC']],
                });
            }
            else {
                categoryData = await this.categoryModel.findAll();
            }
            return categoryData;
        }
        catch (error) {
            console.error('Error: ', error);
            throw error;
        }
    }
    async updateCategoryPositions(body) {
        try {
            let data = await this.categoryModel.findAll({ raw: true });
            const oldPosition = body.oldPosition;
            const newPosition = body.newPosition;
            const categories = data.map((category) => {
                if (category.id === body.id) {
                    return { ...category, Position: newPosition };
                }
                else if (oldPosition < newPosition &&
                    category.Position > oldPosition &&
                    category.Position <= newPosition) {
                    return { ...category, Position: category.Position - 1 };
                }
                else if (oldPosition > newPosition &&
                    category.Position >= newPosition &&
                    category.Position < oldPosition) {
                    return { ...category, Position: category.Position + 1 };
                }
                return category;
            });
            for (const category of categories) {
                await this.categoryModel.update({ Position: category.Position }, { where: { id: category.id } });
            }
            const updatedCategories = categories.filter((category) => {
                if (category.id === body.id) {
                    return true;
                }
                else if (oldPosition < newPosition &&
                    category.Position >= oldPosition &&
                    category.Position <= newPosition) {
                    return true;
                }
                else if (oldPosition > newPosition &&
                    category.Position >= newPosition &&
                    category.Position < oldPosition) {
                    return true;
                }
                return false;
            });
            const response = updatedCategories.map((category) => {
                return {
                    id: category.id,
                    oldPosition: oldPosition,
                    newPosition: category.Position,
                };
            });
            return response;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async AllCategoriesUserMenuBar() {
        try {
            const findAllCategories = await this.categoryModel.findAll({
                where: { status: 1 },
                include: [
                    {
                        model: this.SubCategoryModel,
                        attributes: [
                            'id',
                            'category_id',
                            'sub_category_name',
                            'sub_catetgory_slug_url',
                            'sub_category_image',
                        ],
                    },
                ],
                attributes: [
                    'id',
                    'category_name',
                    'category_slug_url',
                    'include_store_menu',
                    'Position',
                ],
                raw: true,
            });
            const allProducts = [];
            const categoryMap = new Map();
            findAllCategories.forEach((item) => {
                allProducts.push(item);
                const categoryId = item.id;
                if (!categoryMap.has(categoryId)) {
                    categoryMap.set(categoryId, {
                        id: categoryId,
                        category_name: item.category_name,
                        category_slug_url: item.category_slug_url,
                        include_store_menu: item.include_store_menu,
                        Position: item.Position,
                        sub_categories: [],
                    });
                }
                if (item['sub_categories.id']) {
                    const subCategory = {
                        id: item['sub_categories.id'],
                        category_id: item['sub_categories.category_id'],
                        sub_category_name: item['sub_categories.sub_category_name'],
                        sub_catetgory_slug_url: item['sub_categories.sub_catetgory_slug_url'],
                        sub_category_image: item['sub_categories.sub_category_image'],
                    };
                    categoryMap.get(categoryId).sub_categories.push(subCategory);
                }
            });
            const sortedCategories = Array.from(categoryMap.values()).sort((a, b) => (a.Position || 0) - (b.Position || 0));
            const resultArray = [
                {
                    category_name: 'All Products',
                    categories: sortedCategories.map((category) => ({
                        id: category.id,
                        category_name: category.category_name,
                        category_slug_url: category.category_slug_url,
                        include_store_menu: category.include_store_menu,
                        Position: category.Position,
                        sub_categories: category.sub_categories,
                    })),
                },
            ];
            sortedCategories.forEach((category) => {
                if (category.include_store_menu === 1) {
                    resultArray.push({
                        category_name: category.category_name,
                        Position: category.Position,
                        sub_categories: category.sub_categories,
                    });
                }
            });
            return resultArray;
        }
        catch (error) {
            throw error;
        }
    }
};
__decorate([
    activityLogger_1.ActivityLogger.createLog('Category', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesService.prototype, "updateCategories", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Category', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoriesService.prototype, "deleteCategorie", null);
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(categories_schema_1.Categories)),
    __param(1, (0, sequelize_1.InjectModel)(sub_categories_schema_1.Sub_Categories)),
    __param(2, (0, sequelize_1.InjectModel)(product_schema_1.Products)),
    __metadata("design:paramtypes", [Object, Object, Object])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map