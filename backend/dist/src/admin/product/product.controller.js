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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const product_service_1 = require("./product.service");
const commonResponse_1 = require("../../../Helper/commonResponse");
const S3Bucket_1 = require("../../../Helper/S3Bucket");
const product_schema_1 = require("./product.schema");
const productImage_schema_1 = require("./productImage.schema");
const class_validator_1 = require("class-validator");
const product_createValidation_1 = require("./Validation/product.createValidation");
const sequelize_1 = require("@nestjs/sequelize");
const createProductImg_dto_1 = require("./dto/createProductImg.dto");
const uuid_1 = require("uuid");
const imageConfigration_1 = require("../../../Helper/imageConfigration");
const multiple_files_interceptor_1 = require("./multiple-files.interceptor");
let ProductController = exports.ProductController = class ProductController {
    constructor(ProductsImageModel, s3Service, productService) {
        this.ProductsImageModel = ProductsImageModel;
        this.s3Service = s3Service;
        this.productService = productService;
    }
    isValidMySQLId(id) {
        const regex = /^\d+$/;
        return regex.test(id);
    }
    async Productcreate(reqBody, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const errors = {};
            const productInput = new product_createValidation_1.ValidateProduct();
            productInput.product_name = reqBody.product_name;
            productInput.product_slug_url = reqBody.product_slug_url;
            productInput.category_id = reqBody.category_id;
            productInput.sub_category_id = reqBody.sub_category_id;
            productInput.description = reqBody.description;
            productInput.product_price = reqBody.product_price;
            productInput.rating = reqBody.rating;
            const validation_errors = await (0, class_validator_1.validate)(productInput);
            const findProductExist = await this.productService.ProductNameExist(productInput);
            if (findProductExist) {
                errors['product_name'] = 'This Product name is already exist';
            }
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Validation Error', errors);
            }
            const createdData = await this.productService.createProduct(req.user, productInput);
            if (createdData) {
                return new commonResponse_1.Success(res, 200, createdData, '🎉 Product Created Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, null, 'Something went wrong during creation');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllProductList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let product_listing = await this.productService.allProductListing(req.body, req.user);
            if (product_listing) {
                return new commonResponse_1.Success(res, 200, product_listing, '🎉 All Product Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, product_listing, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getByIdProductList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ProductId = req.params.id;
            if (!this.isValidMySQLId(ProductId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Product id', 'Product id isnot valid');
            }
            const existingProduct = await this.productService.ProductsById(req.user, ProductId);
            if (!existingProduct) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Product not found', 'ProductID doesnot found in database');
            }
            return new commonResponse_1.Success(res, 200, existingProduct, '🔍 Product Found Successfully!');
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async ProductDeleteById(id, req, res) {
        try {
            const ProductId = req.params.id;
            if (!this.isValidMySQLId(ProductId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Product id', 'Product id isnot valid');
            }
            const existingProduct = await this.productService.ProductsById(req.user, ProductId);
            if (!existingProduct) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Product not found', 'ProductID doesnot found in database');
            }
            const product = await this.ProductsImageModel.findOne({ where: { product_id: ProductId, deleted_at: null } });
            if (!product) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Product not found', 'Product ID does not exist in the database');
            }
            ``;
            const filenames = product?.product_image.map(image => image['fileName']);
            await this.s3Service.deleteProduct(filenames);
            const data = await this.productService.deleteProduct(req.user, id);
            if (data) {
                return new commonResponse_1.Success(res, 200, {}, '🗑️ Product Deleted Successfully!');
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
    async updateProductById(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ProductId = req.params.id;
            if (!this.isValidMySQLId(ProductId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Product id', 'Product id isnot valid');
            }
            const existingProduct = await this.productService.ProductsById(req.user, ProductId);
            if (!existingProduct) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Product not found', 'ProductID doesnot found in database');
            }
            const errors = {};
            const productInput = new product_createValidation_1.ValidateProduct();
            productInput.category_id = req.body.category_id;
            productInput.sub_category_id = req.body.sub_category_id;
            productInput.product_name = req.body.product_name;
            productInput.product_slug_url = req.body.product_slug_url;
            productInput.description = req.body.description;
            productInput.product_price = req.body.product_price;
            const validation_errors = await (0, class_validator_1.validate)(productInput);
            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
            }
            const updateData = await this.productService.updateProduct(req.user, id, req.body);
            if (updateData) {
                return new commonResponse_1.Success(res, 200, true, '🎊 Product Updated Successfully!');
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
    async getAllProductListValueLabelWise(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let subcategories_listing_VL = await this.productService.allProductsListingVL(req.user);
            if (subcategories_listing_VL) {
                return new commonResponse_1.Success(res, 200, subcategories_listing_VL, '📋 All Products Listed Successfully by Label and Value!');
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
    async productFeatures(requestBody, req) {
        try {
            const newProductFeatures = await this.productService.CreateProductFeatures(req.user, requestBody);
            return {
                success: true,
                data: newProductFeatures,
            };
        }
        catch (error) {
            console.log(error);
            return { success: false, error: 'Failed to create product features' };
        }
    }
    async getAllProductsFeatures(reqBody) {
        try {
            const productsFeatures = await this.productService.GetAllProductsFeatures(reqBody);
            return {
                success: true,
                status: 200,
                message: '🎉 All Product Listed Successfully!',
                data: productsFeatures,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to fetch products features',
                error: error.message,
            };
        }
    }
    async productImageCreate(createProductImageDto, req, res, files) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const errors = {};
            const productExists = await product_schema_1.Products.findOne({
                where: { id: createProductImageDto.product_id, deleted_at: null },
            });
            if (!productExists) {
                errors['product_id'] = 'This Product id does not exist';
                return new commonResponse_1.CustomResponse(res, 400, errors, 'Product id does not exist');
            }
            const productImages = files.product_image || [];
            const defaultImages = files.default_image || [];
            if (productImages.length > 0 || defaultImages.length > 0) {
                const resizedImages = await Promise.all(productImages.map(async (file) => {
                    const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(file.buffer, 150, 150);
                    return { buffer: resizedImageBuffer, originalname: file.originalname };
                }));
                const resizedDefaultImages = await Promise.all(defaultImages.map(async (file) => {
                    const resizedImageBuffer = await (0, imageConfigration_1.resizeImage)(file.buffer, 150, 150);
                    return { buffer: resizedImageBuffer, originalname: file.originalname };
                }));
                const filesWithId = productImages.map((file) => ({
                    id: (0, uuid_1.v4)(),
                    fileName: `${Date.now()}-${file.originalname}`,
                }));
                const defaultFilesWithId = defaultImages.map((file) => ({
                    id: (0, uuid_1.v4)(),
                    fileName: `${Date.now()}-${file.originalname}`,
                }));
                if (productImages.length > 0) {
                    await this.s3Service.uploadFileToS3ForProduct(resizedImages, filesWithId.map(file => file.fileName));
                }
                if (defaultImages.length > 0) {
                    await this.s3Service.uploadFileToS3ForProduct(resizedDefaultImages, filesWithId.map(file => file.fileName));
                }
                const createdData = await this.productService.createProductImages(req.user, createProductImageDto, filesWithId, defaultFilesWithId);
                return new commonResponse_1.Success(res, 200, {
                    product_id: createProductImageDto.product_id,
                    product_image: createdData['newImages'],
                    default_image: createdData['newDefaultImages']
                }, '🎉 Product Images added Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, {}, 'Product image is required');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllProductImageList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let productImages = await this.productService.GetAllProductsImage(req.body, req.user);
            if (productImages) {
                return new commonResponse_1.Success(res, 200, productImages, '🎉 All Product Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, productImages, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getOneProductImageList(productId, res) {
        try {
            const productImage = await this.productService.ProductImagesByID(productId);
            if (productImage) {
                return new commonResponse_1.Success(res, 200, productImage, '🎉 Product Image Retrieved Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 404, null, 'Product image not found');
            }
        }
        catch (error) {
            console.error('Error in getOneProductImageList:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async productImageRemove(product_id, image_id, req, res) {
        try {
            const product = await this.ProductsImageModel.findOne({ where: { product_id: product_id, deleted_at: null } });
            if (!product) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Product not found', 'Product ID does not exist in the database');
            }
            const existingProductImage = product.product_image.find(image => image['id'] === image_id);
            if (!existingProductImage) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Image not found', "Image ID does not exist in the product's images");
            }
            const productImage = await this.productService.deleteProductImageById(req.user, product_id, image_id);
            await this.s3Service.deleteProductImage([{ id: image_id, fileName: existingProductImage['fileName'] }]);
            if (productImage) {
                return new commonResponse_1.Success(res, 200, productImage, '🎉 Product Image Delete Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 404, null, 'Product image not found');
            }
        }
        catch (error) {
            console.error('Error in deleteProductImage:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async updateProductImageById(id, requestBody, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const productImageId = id;
            if (!this.isValidMySQLId(productImageId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Product_Image id', 'Product_Image id is not valid');
            }
            let existingProductImage = await this.ProductsImageModel.findByPk(id);
            if (existingProductImage) {
                const updatedImages = [];
                for (const image of requestBody.product_image) {
                    if (image.startsWith('http')) {
                        const filenameWithTimestamp = image.split('/').pop();
                        updatedImages.push(filenameWithTimestamp);
                    }
                    else {
                        const timestampedFilename = `${Date.now()}-${image}`;
                        updatedImages.push(timestampedFilename);
                    }
                }
                existingProductImage.product_image = updatedImages;
                await existingProductImage.save();
            }
            return new commonResponse_1.Success(res, 200, {}, 'Product image updated successfully!');
        }
        catch (error) {
            console.log('Error updating product image:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong while updating product image');
        }
    }
    async getAllProductImagesListValueLabelWise(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let product_images_listing_VL = await this.productService.allProductImagesListingVL(req.user);
            if (product_images_listing_VL) {
                return new commonResponse_1.Success(res, 200, product_images_listing_VL, '📋 All Products Listed Successfully by Label and Value!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, product_images_listing_VL, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async productFeaturesMaster(requestBody, req, res) {
        try {
            const newProductFeatures = await this.productService.CreateProductFeaturesMaster(req.user, requestBody);
            return new commonResponse_1.Success(res, 200, newProductFeatures, 'Product features created successfully');
        }
        catch (error) {
            console.error('Error creating product features:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Failed to create product features');
        }
    }
    async getAllProductFeatureMasterList(req, res) {
        try {
            const { user, body } = req;
            if (!user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const productListing = await this.productService.allProductFeaturesMasterListing(body, user);
            if (productListing) {
                const parsedProductListing = {
                    ...productListing,
                    Product_listing: productListing.Product_listing.map(item => ({
                        ...item,
                        modules: JSON.parse(item.modules),
                        features: JSON.parse(item.features),
                        custom_fields: JSON.parse(item.custom_fields),
                    })),
                };
                return new commonResponse_1.Success(res, 200, parsedProductListing, '🎉 All Product Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, productListing, 'Something went wrong');
            }
        }
        catch (error) {
            console.error('Create Block Error ->', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getOneProductFeatureMasterList(productId, res) {
        try {
            const productListing = await this.productService.ProductFeaturesMasterById(productId);
            if (!productListing || productListing.length === 0) {
                return new commonResponse_1.CustomResponse(res, 404, null, 'Product features not found');
            }
            const parsedProductListing = productListing.map(item => ({
                ...item,
                modules: JSON.parse(item.modules),
                features: JSON.parse(item.features),
                custom_fields: JSON.parse(item.custom_fields),
            }));
            const responseData = {
                Product_listing: parsedProductListing,
            };
            return new commonResponse_1.Success(res, 200, responseData, '🎉 Product Features Retrieved Successfully!');
        }
        catch (error) {
            console.error('Error in getOneProductFeatureMasterList:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.message || error.toString(), 'Something went wrong');
        }
    }
    async measurementLogic(requestBody, req, res) {
        try {
            const newMeasurement = await this.productService.productMeasurements(req.user, requestBody);
            return new commonResponse_1.Success(res, 200, newMeasurement, 'Product measurement created successfully');
        }
        catch (error) {
            console.error('Error creating product measurement:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Failed to create product measurement');
        }
    }
    async getAllProductMeasurementList(req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            let product_listing = await this.productService.allProductMeasurementsListing(req.body, req.user);
            if (product_listing) {
                return new commonResponse_1.Success(res, 200, product_listing, '🎉 All Measurements Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, product_listing, 'Something went wrong');
            }
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getByIdProductMeasurementList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ProductId = req.params.id;
            if (!this.isValidMySQLId(ProductId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid Product id', 'Product id isnot valid');
            }
            const existingProduct = await this.productService.productMeasurementsById(req.user, ProductId);
            if (!existingProduct) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Product not found', 'ProductID doesnot found in database');
            }
            return new commonResponse_1.Success(res, 200, existingProduct, '🔍 Product Measurement Found Successfully!');
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async allTrendingProductsListingVL() {
        try {
            const trendingProducts = await this.productService.allTrendingProductsListingVL();
            return { success: true, data: trendingProducts };
        }
        catch (error) {
            return { success: false, message: 'Failed to fetch trending products', error: error.toString() };
        }
    }
    async filterProducts(sortByName, minPrice, maxPrice, rating) {
        return this.productService.filterProducts(sortByName, minPrice, maxPrice, rating);
    }
    async productDetails(id, req, res) {
        try {
            var findProduct = await this.productService.findProductForUserPanel(id);
            res.json(findProduct);
        }
        catch (error) {
            console.log(error, ":----------");
        }
    }
    async subCategoryWiseProductImage(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const subCategoryId = req.params.id;
            if (!this.isValidMySQLId(subCategoryId)) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Enter valid SubCategory id', 'Category id is not valid');
            }
            const ListData = await this.productService.subCategoryWiseProductImage(subCategoryId);
            if (!ListData) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'Subcategory not found', 'subCategoryId doesnot found in database');
            }
            return new commonResponse_1.Success(res, 200, ListData, '🔍 Default Images Found Successfully!');
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async exportExcel(res, req) {
        try {
            const bufferData = await this.productService.ExportExcel();
            return new commonResponse_1.Success(res, 200, bufferData, '📋 Product Excel Successfully Export!');
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
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "Productcreate", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAllProductList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getByIdProductList", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "ProductDeleteById", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateProductById", null);
__decorate([
    (0, common_1.Get)('list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAllProductListValueLabelWise", null);
__decorate([
    (0, common_1.Post)('product-features'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "productFeatures", null);
__decorate([
    (0, common_1.Post)('product-features/list'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAllProductsFeatures", null);
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)(new multiple_files_interceptor_1.MultipleFilesInterceptor([
        { name: 'product_image', maxCount: 10 },
        { name: 'default_image', maxCount: 2 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createProductImg_dto_1.CreateProductImageDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "productImageCreate", null);
__decorate([
    (0, common_1.Post)('product_images/list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAllProductImageList", null);
__decorate([
    (0, common_1.Get)('product_images/list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getOneProductImageList", null);
__decorate([
    (0, common_1.Post)('delete/productID/:product_id/imageID/:image_id'),
    __param(0, (0, common_1.Param)('product_id')),
    __param(1, (0, common_1.Param)('image_id')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "productImageRemove", null);
__decorate([
    (0, common_1.Post)('image/update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateProductImageById", null);
__decorate([
    (0, common_1.Get)('product_images/list_V_L'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAllProductImagesListValueLabelWise", null);
__decorate([
    (0, common_1.Post)('product-features-master'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "productFeaturesMaster", null);
__decorate([
    (0, common_1.Post)('product-features-master/list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAllProductFeatureMasterList", null);
__decorate([
    (0, common_1.Get)('product-features-master/list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getOneProductFeatureMasterList", null);
__decorate([
    (0, common_1.Post)('measurement'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "measurementLogic", null);
__decorate([
    (0, common_1.Post)('measurement/list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAllProductMeasurementList", null);
__decorate([
    (0, common_1.Get)('measurement/list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getByIdProductMeasurementList", null);
__decorate([
    (0, common_1.Get)('trending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "allTrendingProductsListingVL", null);
__decorate([
    (0, common_1.Get)('filter-products'),
    __param(0, (0, common_1.Query)('sortByName')),
    __param(1, (0, common_1.Query)('minPrice')),
    __param(2, (0, common_1.Query)('maxPrice')),
    __param(3, (0, common_1.Query)('rating')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "filterProducts", null);
__decorate([
    (0, common_1.Post)('user/produc_details/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "productDetails", null);
__decorate([
    (0, common_1.Get)('subcategorywiseproductimages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "subCategoryWiseProductImage", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "exportExcel", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)('product'),
    __param(0, (0, sequelize_1.InjectModel)(productImage_schema_1.ProductsImage)),
    __metadata("design:paramtypes", [Object, S3Bucket_1.S3Service,
        product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map