/// <reference types="multer" />
import { SubCategoriesService } from './sub_categories.service';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { S3Service } from '../../../Helper/S3Bucket';
export declare class SubCategoriesController {
    private readonly s3Service;
    private readonly subCategoryService;
    constructor(s3Service: S3Service, subCategoryService: SubCategoriesService);
    isValidMySQLId(id: string): boolean;
    Subcategoriecreate(CreateSubCategory: any, req: any, res: Response, sub_category_image: Express.Multer.File): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllSubCategoryList(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getByIdSubCategoriesList(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    SubcategorieDeleteById(id: string, req: any, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    updateCategoriesById(id: string, req: any, res: Response, sub_category_image: Express.Multer.File): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllSubcategoryListValueLabelWise(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getSubcategoryListValueLabelWiseByID(id: string, req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse | CustomCatchBlockErrorMessage>;
    getAllSubCategoryListValueLabelWiseWithProducts(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomCatchBlockErrorMessage>;
    exportExcel(res: Response, req: Request): Promise<Success | CustomCatchBlockErrorMessage>;
}
