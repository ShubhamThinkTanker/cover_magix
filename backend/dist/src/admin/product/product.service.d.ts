import { Sequelize } from 'sequelize';
import { Products } from './product.schema';
import { ProductsImage } from './productImage.schema';
import { Sub_Categories } from '../sub_categories/sub_categories.schema';
import { Categories } from '../categories/categories.schema';
import { ProductsFeatures } from './productFeatures.schema';
import { FabricsMaterial } from '../fabric/fabricMaterial.schema';
import { Tie_Down } from '../tie_downs/tie_downs.schema';
import { Grommets } from '../grommets/grommets.schema';
import { Air_bags } from '../air_bags/air_bags.schema';
import { ProductsFeaturesMaster } from './productFeatureMaster.schema';
import { ProductsMeasurement } from './product_measurement.schema ';
import { InputData } from './interfaces/product.measurement';
import * as ExcelJS from 'exceljs';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class ProductService {
    private productModel;
    private ProductsImageModel;
    private productFeaturesModel;
    private productFeactureMasterModel;
    private productsMeasurementModel;
    private tiedownModel;
    private grommetsModel;
    private fabricMaterialModel;
    private AirBagsModel;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(productModel: typeof Products, ProductsImageModel: typeof ProductsImage, productFeaturesModel: typeof ProductsFeatures, productFeactureMasterModel: typeof ProductsFeaturesMaster, productsMeasurementModel: typeof ProductsMeasurement, tiedownModel: typeof Tie_Down, grommetsModel: typeof Grommets, fabricMaterialModel: typeof FabricsMaterial, AirBagsModel: typeof Air_bags, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    ProductNameExist(reqBody: any): Promise<Products>;
    createProduct(reqUser: any, reqBody: any): Promise<Products>;
    CreateProductFeatures(reqUser: any, data: any): Promise<ProductsFeatures>;
    GetAllProductsFeatures(reqbody: any): Promise<{
        totalRecords: number;
        Product_Features_list: {
            id: number;
            product: Products;
            fabric: {
                id: number;
                fabric_id: number;
                color_name: string;
                color: string;
                fabric_image: string;
            }[];
            tie_down: {
                id: number;
                tie_down_name: string;
                price: string;
                tie_down_image: string;
            }[];
            grommet: {
                id: number;
                grommet_name: string;
                price: string;
                grommet_image: string;
            }[];
            meta_data: string;
        }[];
    }>;
    createProductImages(reqUser: any, createProductImageDto: any, filesWithId: any, defaultFilesWithId: any): Promise<{
        newImages: any;
        newDefaultImages: any;
        generatedIds: any;
        defaultImageGeneratedIds: any;
    }>;
    subCategoryWiseProductImage(subCategoryId: any): Promise<Products[]>;
    GetAllProductsImage(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Product_Images_list: {
            product_image: {
                id: any;
                images: string;
            }[];
            id: number;
            product_id: number;
            product: Products;
            default_image: string[];
            created_at: Date;
            updated_at: Date;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: ProductsImage;
            dataValues: ProductsImage;
            _creationAttributes: ProductsImage;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<ProductsImage, ProductsImage>;
        }[];
    }>;
    ProductImagesByID(id: any): Promise<{
        id: number;
        product_id: number;
        product_image: {
            id: any;
            images: string;
        }[];
    }>;
    deleteProductImageById(reqUser: any, product_id: number, image_id: string): Promise<{
        remaining_images: string[];
    }>;
    allProductListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Product_listing: {
            created_at: string;
            updated_at: string;
            id: number;
            category_id: number;
            category: Categories;
            sub_category_id: number;
            sub_category: Sub_Categories;
            product_name: string;
            product_slug_url: string;
            description: string;
            product_price: number;
            meta_data: string;
            rating: number;
            deleted_at: Date;
            images: ProductsImage[];
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Products;
            dataValues: Products;
            _creationAttributes: Products;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<Products, Products>;
        }[];
    }>;
    ProductsById(reqUser: any, id: any): Promise<{
        created_at: string;
        updated_at: string;
        id: number;
        category_id: number;
        category: Categories;
        sub_category_id: number;
        sub_category: Sub_Categories;
        product_name: string;
        product_slug_url: string;
        description: string;
        product_price: number;
        meta_data: string;
        rating: number;
        deleted_at: Date;
        images: ProductsImage[];
        createdAt?: any;
        updatedAt?: any;
        deletedAt?: any;
        version?: any;
        _attributes: Products;
        dataValues: Products;
        _creationAttributes: Products;
        isNewRecord: boolean;
        sequelize: Sequelize;
        _model: import("sequelize").Model<Products, Products>;
    }>;
    deleteProduct(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Products[]]>;
    updateProduct(reqUser: any, id: any, reqBody: any): Promise<[affectedCount: number, affectedRows: Products[]]>;
    allProductsListingVL(reqUser: any): Promise<{
        value: number;
        label: string;
    }[]>;
    allProductImagesListingVL(reqUser: any): Promise<{
        value: number;
        label: {
            product_id: number;
            product_image: string[];
        };
    }[]>;
    CreateProductFeaturesMaster(reqUser: any, data: any): Promise<ProductsFeaturesMaster>;
    allProductFeaturesMasterListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Product_listing: ProductsFeaturesMaster[];
    }>;
    ProductFeaturesMasterById(id: any): Promise<ProductsFeaturesMaster[]>;
    calculateArea(data: InputData): {
        area_sq_inches: string;
        area_sq_meters: string;
        total_material_sq_meters: string;
        cost: string;
    };
    productMeasurements(reqUser: any, data: InputData): Promise<any>;
    allProductMeasurementsListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Product_listing: ProductsMeasurement[];
    }>;
    productMeasurementsById(user: any, id: any): Promise<ProductsMeasurement[]>;
    allTrendingProductsListingVL(): Promise<{
        value: number;
        label: {
            product_id: number;
            product_name: string;
            product_image: ProductsImage[];
            ratings: number;
        };
    }[]>;
    filterProducts(sortByName?: boolean, minPrice?: number, maxPrice?: number, rating?: number): Promise<Products[]>;
    ExportExcel(): Promise<ExcelJS.Buffer>;
    findProductForUserPanel(id: any): Promise<Products[]>;
}
