/// <reference types="multer" />
import { CategoriesService } from './categories.service';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { S3Service } from '../../../Helper/S3Bucket';
import { Categories } from './categories.schema';
export declare class CategoriesController {
    private categoryModel;
    private readonly s3Service;
    private readonly categoryService;
    constructor(categoryModel: typeof Categories, s3Service: S3Service, categoryService: CategoriesService);
    isValidMySQLId(id: string): boolean;
    categoriecreate(CreateCategory: any, req: any, res: Response, category_image: Express.Multer.File): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllCategoryList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdCategoriesList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    updateCategoriesById(id: string, req: any, res: Response, category_image: Express.Multer.File): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    categorieDeleteById(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllCategoryListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllCategoryListValueLabelWiseWithStatus(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllCategoryListValueLabelWiseWithSubCategories(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    getCategoryWiseSubcategoriesAndProducts(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    getCategoryWiseSubcategoriesAndProductsById(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    getAllCategoryListValueLabelWiseWithProducts(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    exportExcel(res: Response, req: Request): Promise<Success | CustomCatchBlockErrorMessage>;
    getCategories(type: number): Promise<any>;
    updatePositions(req: any, res: Response): Success;
    listingAllCategoriesForUserWesite(req: any, res: Response): Promise<Success | CustomCatchBlockErrorMessage>;
}
