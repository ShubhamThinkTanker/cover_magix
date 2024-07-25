/// <reference types="multer" />
import { ProductService } from './product.service';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { S3Service } from '../../../Helper/S3Bucket';
import { Products } from './product.schema';
import { ProductsImage } from './productImage.schema';
import { CreateProductImageDto } from './dto/createProductImg.dto';
import { InputData } from './interfaces/product.measurement';
export declare class ProductController {
    private ProductsImageModel;
    private readonly s3Service;
    private readonly productService;
    constructor(ProductsImageModel: typeof ProductsImage, s3Service: S3Service, productService: ProductService);
    isValidMySQLId(id: string): boolean;
    Productcreate(reqBody: any, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllProductList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdProductList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    ProductDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    updateProductById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllProductListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    productFeatures(requestBody: any, req: any): Promise<{
        success: boolean;
        data: import("./productFeatures.schema").ProductsFeatures;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    getAllProductsFeatures(reqBody: any): Promise<{
        success: boolean;
        status: number;
        message: string;
        data: {
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
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        status?: undefined;
        data?: undefined;
    }>;
    productImageCreate(createProductImageDto: CreateProductImageDto, req: any, res: Response, files: {
        product_image?: Express.Multer.File[];
        default_image?: Express.Multer.File[];
    }): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllProductImageList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getOneProductImageList(productId: string, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    productImageRemove(product_id: number, image_id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    updateProductImageById(id: string, requestBody: {
        product_image: string[];
    }, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    getAllProductImagesListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    productFeaturesMaster(requestBody: any, req: any, res: Response): Promise<Success | CustomCatchBlockErrorMessage>;
    getAllProductFeatureMasterList(req: Request, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getOneProductFeatureMasterList(productId: string, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    measurementLogic(requestBody: InputData, req: any, res: Response): Promise<Success | CustomCatchBlockErrorMessage>;
    getAllProductMeasurementList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdProductMeasurementList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    allTrendingProductsListingVL(): Promise<{
        success: boolean;
        data: {
            value: number;
            label: {
                product_id: number;
                product_name: string;
                product_image: ProductsImage[];
                ratings: number;
            };
        }[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    filterProducts(sortByName?: boolean, minPrice?: number, maxPrice?: number, rating?: number): Promise<Products[]>;
    productDetails(id: any, req: any, res: Response): Promise<void>;
    subCategoryWiseProductImage(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    exportExcel(res: Response, req: Request): Promise<Success | CustomCatchBlockErrorMessage>;
}
