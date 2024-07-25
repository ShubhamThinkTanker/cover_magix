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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const product_schema_1 = require("./product.schema");
const productImage_schema_1 = require("./productImage.schema");
const sub_categories_schema_1 = require("../sub_categories/sub_categories.schema");
const categories_schema_1 = require("../categories/categories.schema");
const productFeatures_schema_1 = require("./productFeatures.schema");
const fabricMaterial_schema_1 = require("../fabric/fabricMaterial.schema");
const tie_downs_schema_1 = require("../tie_downs/tie_downs.schema");
const grommets_schema_1 = require("../grommets/grommets.schema");
const air_bags_schema_1 = require("../air_bags/air_bags.schema");
const productFeatureMaster_schema_1 = require("./productFeatureMaster.schema");
const product_measurement_schema_1 = require("./product_measurement.schema ");
const ExcelJS = require("exceljs");
const dateFormat_1 = require("../../../Helper/dateFormat");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let ProductService = exports.ProductService = class ProductService {
    constructor(productModel, ProductsImageModel, productFeaturesModel, productFeactureMasterModel, productsMeasurementModel, tiedownModel, grommetsModel, fabricMaterialModel, AirBagsModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.productModel = productModel;
        this.ProductsImageModel = ProductsImageModel;
        this.productFeaturesModel = productFeaturesModel;
        this.productFeactureMasterModel = productFeactureMasterModel;
        this.productsMeasurementModel = productsMeasurementModel;
        this.tiedownModel = tiedownModel;
        this.grommetsModel = grommetsModel;
        this.fabricMaterialModel = fabricMaterialModel;
        this.AirBagsModel = AirBagsModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async ProductNameExist(reqBody) {
        try {
            const products = await this.productModel.findOne({
                where: { product_name: reqBody.product_name, deleted_at: null },
                raw: true,
                nest: true,
            });
            return products;
        }
        catch (error) {
            throw error;
        }
    }
    async createProduct(reqUser, reqBody) {
        try {
            const { category_id, sub_category_id, product_name, description, product_slug_url, product_price, rating, } = reqBody;
            const existingProduct = await this.productModel.findOne({
                where: { product_name: product_name },
            });
            if (existingProduct) {
                throw new Error('This Product is already exists.');
            }
            const newProduct = await this.productModel.create({
                category_id: category_id,
                sub_category_id: sub_category_id,
                product_name: product_name,
                product_slug_url: product_slug_url,
                description: description,
                product_price: product_price,
                rating: rating,
                created_at: new Date(),
            });
            return newProduct;
        }
        catch (error) {
            console.error('Error creating product:', error);
            throw new common_1.BadRequestException(error.message || 'Could not create product.');
        }
    }
    async CreateProductFeatures(reqUser, data) {
        try {
            const { product_id, grommet_id, tie_down_id, fabric_id } = data;
            if (product_id) {
                return this.productFeaturesModel.create({
                    product_id,
                    grommet_id,
                    tie_down_id,
                    fabric_id,
                });
            }
            else {
                throw new Error('This Product is not available');
            }
        }
        catch (error) {
            console.log(error);
            throw new Error('Error creating product features');
        }
    }
    async GetAllProductsFeatures(reqbody) {
        try {
            let order_column = reqbody.order_column || 'id';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (filter_value) {
                whereClause[sequelize_2.Op.or] = [
                    { product_name: { [sequelize_2.Op.like]: `%${filter_value}%` } },
                    { description: { [sequelize_2.Op.like]: `%${filter_value}%` } },
                ];
            }
            const { count, rows } = await productFeatures_schema_1.ProductsFeatures.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: product_schema_1.Products,
                        as: 'product',
                        attributes: [
                            'id',
                            'category_id',
                            'sub_category_id',
                            'product_name',
                            'description',
                            'product_price',
                            'meta_data',
                            'created_at',
                        ],
                    },
                ],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true,
            });
            const mappedFeatures = await Promise.all(rows.map(async (feature) => {
                const fabric = feature.fabric_id
                    ? await fabricMaterial_schema_1.FabricsMaterial.findAll({
                        where: { id: feature.fabric_id },
                    })
                    : null;
                const tieDown = feature.tie_down_id
                    ? await tie_downs_schema_1.Tie_Down.findAll({ where: { id: feature.tie_down_id } })
                    : null;
                const grommet = feature.grommet_id
                    ? await grommets_schema_1.Grommets.findAll({ where: { id: feature.grommet_id } })
                    : null;
                const fabricWithAttributes = fabric
                    ? fabric.map(({ id, fabric_id, color_name, color, fabric_image, created_at, updated_at, deleted_at, }) => ({
                        id,
                        fabric_id,
                        color_name,
                        color,
                        fabric_image,
                    }))
                    : [];
                const tieDownWithAttributes = tieDown
                    ? tieDown.map(({ id, tie_down_name, price, tie_down_image, created_at, updated_at, deleted_at, }) => ({
                        id,
                        tie_down_name,
                        price,
                        tie_down_image,
                    }))
                    : [];
                const grommetWithAttributes = grommet
                    ? grommet.map(({ id, grommet_name, price, grommet_image, created_at, updated_at, deleted_at, }) => ({
                        id,
                        grommet_name,
                        price,
                        grommet_image,
                    }))
                    : [];
                return {
                    id: feature.id,
                    product: feature.product,
                    fabric: fabricWithAttributes,
                    tie_down: tieDownWithAttributes,
                    grommet: grommetWithAttributes,
                    meta_data: feature.meta_data,
                };
            }));
            return {
                totalRecords: count,
                Product_Features_list: mappedFeatures,
            };
        }
        catch (error) {
            console.error('Error fetching all product features:', error);
            throw error;
        }
    }
    async createProductImages(reqUser, createProductImageDto, filesWithId, defaultFilesWithId) {
        try {
            const { product_id } = createProductImageDto;
            const generatedIds = filesWithId.map((file) => file.id);
            const defaultImageGeneratedIds = defaultFilesWithId.map((file) => file.id);
            const existingProductImage = await this.ProductsImageModel.findOne({
                where: { product_id: product_id },
            });
            if (existingProductImage) {
                const newImages = filesWithId.map((file, index) => ({
                    id: file.id,
                    fileName: file.fileName,
                }));
                const newDefaultImages = defaultFilesWithId.map((file, index) => ({
                    id: file.id,
                    fileName: file.fileName,
                }));
                const updatedProductImage = await this.ProductsImageModel.update({
                    product_image: [
                        ...existingProductImage.product_image,
                        ...newImages,
                    ].flat(),
                    updated_at: new Date(),
                }, { where: { product_id: product_id, deleted_at: null } });
                const updatedDefaultProductImage = await this.ProductsImageModel.update({
                    default_image: [
                        ...newDefaultImages,
                    ].flat(),
                    updated_at: new Date(),
                }, { where: { product_id: product_id, deleted_at: null } });
                return {
                    newImages,
                    newDefaultImages,
                    generatedIds,
                    defaultImageGeneratedIds,
                };
            }
            else {
                const newImages = filesWithId.map((file) => ({
                    id: file.id,
                    fileName: file.fileName,
                }));
                const newDefaultImages = defaultFilesWithId.map((file) => ({
                    id: file.id,
                    fileName: file.fileName,
                }));
                const newProductImage = await this.ProductsImageModel.create({
                    product_id: product_id,
                    product_image: newImages,
                    default_image: newDefaultImages,
                    created_at: new Date(),
                });
                return {
                    newImages,
                    newDefaultImages,
                    generatedIds,
                    defaultImageGeneratedIds,
                };
            }
        }
        catch (error) {
            console.error('Error creating Product Image:', error);
            throw new common_1.BadRequestException('Could not create Product Image.');
        }
    }
    async subCategoryWiseProductImage(subCategoryId) {
        try {
            const products = await product_schema_1.Products.findAll({
                where: { sub_category_id: subCategoryId, deleted_at: null },
                attributes: ['product_name'],
                include: [{ model: productImage_schema_1.ProductsImage, attributes: ['default_image'] }],
                raw: true,
                nest: true,
            });
            console.log(products);
            return products;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async GetAllProductsImage(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'id';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (filter_value) {
                whereClause[sequelize_2.Op.or] = [
                    { category_name: { [sequelize_2.Op.like]: `%${filter_value}%` } },
                ];
            }
            const { count, rows } = await this.ProductsImageModel.findAndCountAll({
                where: whereClause,
                attributes: [
                    'id',
                    'product_id',
                    'product_image',
                    'default_image',
                    'created_at',
                    'updated_at',
                ],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true,
            });
            const modifiedRows = rows.map((row) => {
                const productImages = row.product_image.map((image) => ({
                    id: image['id'],
                    images: `${process.env.ProductS3Url}/${image['fileName']}`,
                }));
                const defaultImages = row.default_image.map((image) => ({
                    id: image['id'],
                    images: `${process.env.ProductS3Url}/${image['fileName']}`,
                }));
                return {
                    ...row,
                    product_image: productImages,
                };
            });
            return {
                totalRecords: count,
                Product_Images_list: modifiedRows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async ProductImagesByID(id) {
        try {
            const productImages = await this.ProductsImageModel.findOne({
                where: { product_id: id },
                attributes: [
                    'id',
                    'product_id',
                    'product_image',
                    'created_at',
                    'updated_at',
                ],
                raw: true,
                nest: true,
            });
            const modifiedRows = {
                id: productImages.id,
                product_id: productImages.product_id,
                product_image: productImages.product_image.map((image) => ({
                    id: image['id'],
                    images: `${process.env.ProductS3Url}/${image['fileName']}`,
                })),
            };
            return modifiedRows;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteProductImageById(reqUser, product_id, image_id) {
        try {
            const existingProductImage = await this.ProductsImageModel.findOne({
                where: { product_id: product_id },
            });
            if (existingProductImage &&
                existingProductImage.product_image &&
                existingProductImage.product_image.length > 0) {
                existingProductImage.product_image =
                    existingProductImage.product_image.filter((image) => image['id'] !== image_id);
                await existingProductImage.save();
                console.log('Image removed successfully');
                const responseData = {
                    remaining_images: existingProductImage.product_image,
                };
                return responseData;
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allProductListing(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'product_name';
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
                        if (key === 'product_name' ||
                            key === 'product_price' ||
                            key === 'created_at' ||
                            key === 'updated_at') {
                            whereClause[key] = { [sequelize_2.Op.like]: `%${value}%` };
                        }
                    }
                }
            }
            const { count, rows } = await product_schema_1.Products.findAndCountAll({
                where: whereClause,
                include: [
                    { model: categories_schema_1.Categories, attributes: ['category_name'] },
                    { model: sub_categories_schema_1.Sub_Categories, attributes: ['sub_category_name'] },
                ],
                attributes: [
                    'id',
                    'category_id',
                    'sub_category_id',
                    'product_name',
                    'description',
                    'product_slug_url',
                    'product_price',
                    'meta_data',
                    'created_at',
                    'updated_at',
                ],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true,
            });
            const formattedRows = rows.map((row) => ({
                ...row,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at)),
            }));
            return {
                totalRecords: count,
                Product_listing: formattedRows,
            };
        }
        catch (error) {
            console.log('Error:', error);
            throw error;
        }
    }
    async ProductsById(reqUser, id) {
        try {
            const data = await this.productModel.findOne({
                where: { id, deleted_at: null },
                attributes: [
                    'id',
                    'category_id',
                    'sub_category_id',
                    'product_name',
                    'description',
                    'product_slug_url',
                    'product_price',
                    'meta_data',
                    'created_at',
                    'updated_at',
                ],
            });
            if (!data) {
                throw new Error('product not found');
            }
            const formattedData = {
                ...data.get(),
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(data.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(data.updated_at)),
            };
            return formattedData;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteProduct(reqUser, id) {
        try {
            const productImages = await this.ProductsImageModel.update({ deleted_at: new Date() }, {
                where: { product_id: id },
                returning: true,
            });
            const productFeatures = await this.productFeaturesModel.update({ deleted_at: new Date() }, {
                where: { product_id: id },
                returning: true,
            });
            const AirBags = await this.AirBagsModel.update({ deleted_at: new Date() }, {
                where: { product_id: id },
                returning: true,
            });
            const product = await this.productModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            return product;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateProduct(reqUser, id, reqBody) {
        try {
            const existingProduct = await this.productModel.findOne({
                where: { product_name: reqBody.product_name },
            });
            if (existingProduct) {
                throw new Error('This Product is already exists.');
            }
            const updatedProduct = await this.productModel.update({
                category_id: reqBody.category_id,
                sub_category_id: reqBody.sub_category_id,
                product_name: reqBody.product_name?.trim(),
                product_slug_url: reqBody.product_slug_url,
                description: reqBody.description?.trim(),
                product_price: reqBody.product_price,
                updated_at: new Date(),
            }, {
                returning: true,
                where: { id: id, deleted_at: null },
            });
            return updatedProduct;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allProductsListingVL(reqUser) {
        try {
            var data = await product_schema_1.Products.findAll({
                where: { deleted_at: null },
                attributes: ['id', 'product_name'],
                order: [['product_name', 'ASC']],
                raw: true,
                nest: true,
            });
            const valueLabelPairs = data?.map((product) => {
                return { value: product?.id, label: product?.product_name };
            });
            return valueLabelPairs;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async allProductImagesListingVL(reqUser) {
        try {
            var data = await productImage_schema_1.ProductsImage.findAll({
                where: { deleted_at: null },
                attributes: ['id', 'product_id', 'product_image'],
                raw: true,
                nest: true,
            });
            const valueLabelPairs = data?.map((product) => {
                return {
                    value: product?.id,
                    label: {
                        product_id: product?.product_id,
                        product_image: product?.product_image,
                    },
                };
            });
            return valueLabelPairs;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async CreateProductFeaturesMaster(reqUser, data) {
        try {
            const { product_id, modules, features, custom_fields } = data;
            const existingRecord = await this.productFeactureMasterModel.findOne({
                where: { product_id },
            });
            if (existingRecord) {
                await existingRecord.update({
                    modules,
                    features,
                    custom_fields,
                });
                return existingRecord;
            }
            else {
                return this.productFeactureMasterModel.create({
                    product_id,
                    modules,
                    features,
                    custom_fields,
                });
            }
        }
        catch (error) {
            console.log(error);
            throw new Error('Error creating or updating product features');
        }
    }
    async allProductFeaturesMasterListing(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'id';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (filter_value) {
                whereClause[sequelize_2.Op.or] = [
                    { product_name: { [sequelize_2.Op.like]: `%${filter_value}%` } },
                ];
            }
            const { count, rows } = await productFeatureMaster_schema_1.ProductsFeaturesMaster.findAndCountAll({
                where: whereClause,
                include: [{ model: product_schema_1.Products, attributes: ['id'] }],
                attributes: [
                    'id',
                    'product_id',
                    'modules',
                    'features',
                    'custom_fields',
                    'created_at',
                    'updated_at',
                ],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true,
            });
            return {
                totalRecords: count,
                Product_listing: rows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async ProductFeaturesMasterById(id) {
        try {
            const products = await this.productFeactureMasterModel.findAll({
                where: { product_id: id },
                attributes: [
                    'id',
                    'product_id',
                    'modules',
                    'features',
                    'custom_fields',
                    'created_at',
                    'updated_at',
                ],
                raw: true,
                nest: true,
            });
            return products;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    calculateArea(data) {
        const { product_measurement, extra_material, material_price } = data;
        let total_area_sq_inches = 0;
        product_measurement.forEach((shape) => {
            Object.values(shape).forEach((shapeData) => {
                const { Height, Width, Depth } = shapeData;
                const area_sq_inches = 2 * (Height * Width + Height * Depth + Width * Depth);
                total_area_sq_inches += area_sq_inches;
            });
        });
        const area_sq_meters = total_area_sq_inches * 0.00064516;
        const total_material_sq_meters = area_sq_meters * (1 + extra_material);
        const cost = total_material_sq_meters * material_price;
        return {
            area_sq_inches: total_area_sq_inches.toFixed(2),
            area_sq_meters: area_sq_meters.toFixed(2),
            total_material_sq_meters: total_material_sq_meters.toFixed(2),
            cost: cost.toFixed(2),
        };
    }
    async productMeasurements(reqUser, data) {
        try {
            const { product_id, product_measurement, extra_material, material_price, type, } = data;
            if (!product_id) {
                throw new Error('Product ID is not provided');
            }
            const result = this.calculateArea(data);
            const existingMeasurement = await this.productsMeasurementModel.findOne({
                where: { product_id },
            });
            let createOrUpdateMeasurement;
            if (existingMeasurement) {
                await this.productsMeasurementModel.update({
                    product_measurement,
                    extra_material: extra_material.toString(),
                    material_price: material_price.toString(),
                    type,
                    area_sq_inches: result.area_sq_inches,
                    area_sq_meters: result.area_sq_meters,
                    total_material_sq_meters: result.total_material_sq_meters,
                    cost: result.cost,
                    updated_at: new Date(),
                }, { where: { product_id } });
                createOrUpdateMeasurement = await this.productsMeasurementModel.findOne({ where: { product_id } });
            }
            else {
                createOrUpdateMeasurement = await this.productsMeasurementModel.create({
                    product_id,
                    product_measurement,
                    extra_material: extra_material.toString(),
                    material_price: material_price.toString(),
                    type,
                    area_sq_inches: result.area_sq_inches,
                    area_sq_meters: result.area_sq_meters,
                    total_material_sq_meters: result.total_material_sq_meters,
                    cost: result.cost,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null,
                });
            }
            return {
                product_id: createOrUpdateMeasurement.product_id,
                area_sq_inches: result.area_sq_inches,
                area_sq_meters: result.area_sq_meters,
                total_material_sq_meters: result.total_material_sq_meters,
                cost: result.cost,
            };
        }
        catch (error) {
            console.error('Error calculating product measurement:', error);
            throw new Error('Error calculating product measurement');
        }
    }
    async allProductMeasurementsListing(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'id';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (filter_value) {
                whereClause[sequelize_2.Op.or] = [
                    { product_name: { [sequelize_2.Op.like]: `%${filter_value}%` } },
                ];
            }
            const { count, rows } = await product_measurement_schema_1.ProductsMeasurement.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: product_schema_1.Products,
                        attributes: ['id', 'product_name', 'product_slug_url'],
                    },
                ],
                attributes: [
                    'id',
                    'area_sq_inches',
                    'area_sq_meters',
                    'total_material_sq_meters',
                    'cost',
                    'created_at',
                    'updated_at',
                ],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true,
            });
            return {
                totalRecords: count,
                Product_listing: rows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async productMeasurementsById(user, id) {
        try {
            const products = await this.productsMeasurementModel.findAll({
                where: { id: id },
                include: [
                    {
                        model: product_schema_1.Products,
                        attributes: ['id', 'product_name', 'product_slug_url'],
                    },
                ],
                attributes: [
                    'id',
                    'area_sq_inches',
                    'area_sq_meters',
                    'total_material_sq_meters',
                    'cost',
                    'created_at',
                    'updated_at',
                ],
                raw: true,
                nest: true,
            });
            return products;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allTrendingProductsListingVL() {
        try {
            const products = await product_schema_1.Products.findAll({
                where: { deleted_at: null, rating: { [sequelize_2.Op.gte]: 4 } },
                attributes: ['id', 'product_name', 'rating'],
                include: [{ model: productImage_schema_1.ProductsImage, attributes: ['product_image'] }],
                raw: true,
                nest: true,
            });
            const valueLabelPairs = products?.map((product) => {
                return {
                    value: product?.id,
                    label: {
                        product_id: product?.id,
                        product_name: product?.product_name,
                        product_image: product?.images,
                        ratings: product?.rating,
                    },
                };
            });
            return valueLabelPairs;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async filterProducts(sortByName, minPrice, maxPrice, rating) {
        const where = {};
        if (minPrice) {
            where.product_price = { [sequelize_2.Op.gte]: minPrice };
        }
        if (maxPrice) {
            where.product_price = where.product_price
                ? { ...where.product_price, [sequelize_2.Op.lte]: maxPrice }
                : { [sequelize_2.Op.lte]: maxPrice };
        }
        if (rating) {
            where.rating = rating;
        }
        const options = {
            where,
            include: [
                { model: productImage_schema_1.ProductsImage, attributes: ['product_image'], as: 'images' },
            ],
        };
        if (sortByName) {
            options.order = [['product_name', 'ASC']];
        }
        options.attributes = [
            'id',
            'product_name',
            'description',
            'product_price',
            'created_at',
        ];
        return this.productModel.findAll(options);
    }
    async ExportExcel() {
        try {
            const ProductData = await this.productModel.findAll({
                where: { deleted_at: null },
                attributes: [
                    'id',
                    'category_id',
                    'sub_category_id',
                    'product_name',
                    'description',
                    'product_slug_url',
                    'product_price',
                    'meta_data',
                    'created_at',
                ],
            });
            const ProductsImageData = await this.ProductsImageModel.findAll({
                where: { deleted_at: null },
                attributes: ['product_image', 'product_id'],
            });
            const ProductsMeasurementData = await this.productsMeasurementModel.findAll({
                where: { deleted_at: null },
                attributes: [
                    'product_id',
                    'product_measurement',
                    'type',
                    'material_price',
                    'extra_material',
                    'area_sq_inches',
                    'area_sq_meters',
                    'total_material_sq_meters',
                    'cost',
                ],
            });
            const ProductFeatureMasterData = await this.productFeactureMasterModel.findAll({
                where: { deleted_at: null },
                attributes: ['product_id', 'modules', 'features', 'custom_fields'],
            });
            const productImageMap = ProductsImageData.reduce((map, imgData) => {
                let images;
                try {
                    images =
                        typeof imgData.product_image === 'string'
                            ? JSON.parse(imgData.product_image)
                            : imgData.product_image;
                }
                catch (error) {
                    images = [];
                }
                map[imgData.product_id] = images;
                return map;
            }, {});
            const productMeasurementMap = ProductsMeasurementData.reduce((map, measurementData) => {
                const productId = measurementData.product_id;
                let measurements;
                try {
                    measurements =
                        typeof measurementData.product_measurement === 'string'
                            ? JSON.parse(measurementData.product_measurement)
                            : measurementData.product_measurement;
                }
                catch (error) {
                    measurements = [];
                }
                if (!map[productId]) {
                    map[productId] = [];
                }
                map[productId].push({
                    ...measurementData.dataValues,
                    product_measurement: measurements,
                });
                return map;
            }, {});
            const productFeatureMasterMap = ProductFeatureMasterData.reduce((map, featureData) => {
                const productId = featureData.product_id;
                const dataValues = featureData.dataValues;
                dataValues.custom_fields = JSON.parse(dataValues.custom_fields);
                map[productId] = dataValues;
                return map;
            }, {});
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Products');
            const headers = [
                { header: 'No', width: 20 },
                { header: 'category_id', key: 'category_id', width: 50 },
                { header: 'sub_category_id', key: 'sub_category_id', width: 50 },
                { header: 'product_name', key: 'product_name', width: 50 },
                { header: 'description', key: 'description', width: 50 },
                { header: 'product_slug_url', key: 'product_slug_url', width: 50 },
                { header: 'product_price', key: 'product_price', width: 50 },
                { header: 'meta_data', key: 'meta_data', width: 50 },
                { header: 'product_image_id', key: 'product_image_id', width: 50 },
                {
                    header: 'product_image_fileName',
                    key: 'product_image_fileName',
                    width: 50,
                },
                {
                    header: 'product_measurement',
                    key: 'product_measurement',
                    width: 50,
                },
                { header: 'type', key: 'type', width: 20 },
                { header: 'material_price', key: 'material_price', width: 20 },
                { header: 'extra_material', key: 'extra_material', width: 50 },
                { header: 'area_sq_inches', key: 'area_sq_inches', width: 50 },
                { header: 'area_sq_meters', key: 'area_sq_meters', width: 50 },
                {
                    header: 'total_material_sq_meters',
                    key: 'total_material_sq_meters',
                    width: 50,
                },
                { header: 'cost', key: 'cost', width: 50 },
                { header: 'modules', key: 'modules', width: 50 },
                { header: 'features', key: 'features', width: 50 },
                { header: 'custom_fields', key: 'custom_fields', width: 50 },
            ];
            worksheet.columns = headers;
            ProductData.forEach((data, index) => {
                const productImages = productImageMap[data.id] || [];
                const productMeasurement = productMeasurementMap[data.id] || [];
                const productFeatureMaster = productFeatureMasterMap[data.id] || {};
                productImages.forEach((imgObj) => {
                    const { id, fileName } = imgObj;
                    productMeasurement.forEach((measurement) => {
                        const customFields = productFeatureMaster.custom_fields || [];
                        const row = worksheet.addRow([
                            index + 1,
                            data.category_id,
                            data.sub_category_id,
                            data.product_name,
                            data.description,
                            data.product_slug_url,
                            data.product_price,
                            data.meta_data,
                            id,
                            fileName,
                            measurement.product_measurement || '',
                            measurement.type || '',
                            measurement.material_price || '',
                            measurement.extra_material || '',
                            measurement.area_sq_inches || '',
                            measurement.area_sq_meters || '',
                            measurement.total_material_sq_meters || '',
                            measurement.cost || '',
                            productFeatureMaster.modules || '',
                            productFeatureMaster.features || '',
                            customFields || '',
                        ]);
                        const fileNameCell = row.getCell('product_image_fileName');
                        fileNameCell.value = {
                            text: fileName,
                            hyperlink: `https://covermagix.s3.ap-south-1.amazonaws.com/upload/Product/${encodeURIComponent(fileName)}`,
                        };
                        fileNameCell.style = {
                            ...fileNameCell.style,
                            font: {
                                color: { argb: 'FF0000FF' },
                                underline: true,
                            },
                        };
                    });
                });
            });
            const Buffer = await workbook.xlsx.writeBuffer();
            console.log('Excel file written successfully.');
            return Buffer;
        }
        catch (error) {
            console.error('Error exporting Excel:', error);
            throw error;
        }
    }
    async findProductForUserPanel(id) {
        try {
            const findProduct = await this.productModel.findAll({
                where: { id: id },
                include: [
                    {
                        model: productImage_schema_1.ProductsImage,
                        where: { product_id: id },
                    },
                ],
                raw: true,
            });
            return findProduct;
            console.log(findProduct, '::::::::::::findProduct');
        }
        catch (error) {
            throw error;
        }
    }
};
__decorate([
    activityLogger_1.ActivityLogger.createLog('Products', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductService.prototype, "createProduct", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Product Features', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductService.prototype, "CreateProductFeatures", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Product Images', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductService.prototype, "createProductImages", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Product Images', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], ProductService.prototype, "deleteProductImageById", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Products', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductService.prototype, "deleteProduct", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Products', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductService.prototype, "updateProduct", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Product Features Master', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductService.prototype, "CreateProductFeaturesMaster", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Product Measurements', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductService.prototype, "productMeasurements", null);
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(product_schema_1.Products)),
    __param(1, (0, sequelize_1.InjectModel)(productImage_schema_1.ProductsImage)),
    __param(2, (0, sequelize_1.InjectModel)(productFeatures_schema_1.ProductsFeatures)),
    __param(3, (0, sequelize_1.InjectModel)(productFeatureMaster_schema_1.ProductsFeaturesMaster)),
    __param(4, (0, sequelize_1.InjectModel)(product_measurement_schema_1.ProductsMeasurement)),
    __param(5, (0, sequelize_1.InjectModel)(tie_downs_schema_1.Tie_Down)),
    __param(6, (0, sequelize_1.InjectModel)(grommets_schema_1.Grommets)),
    __param(7, (0, sequelize_1.InjectModel)(fabricMaterial_schema_1.FabricsMaterial)),
    __param(8, (0, sequelize_1.InjectModel)(air_bags_schema_1.Air_bags)),
    __param(9, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], ProductService);
//# sourceMappingURL=product.service.js.map