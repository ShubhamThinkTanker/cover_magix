import { Sequelize } from 'sequelize';
import { Sub_Categories } from './sub_categories.schema';
import { Categories } from '../categories/categories.schema';
import { Products } from '../product/product.schema';
import { ProductsImage } from '../product/productImage.schema';
import * as ExcelJS from 'exceljs';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare class SubCategoriesService {
    private subcategoryModel;
    private ProductModel;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(subcategoryModel: typeof Sub_Categories, ProductModel: typeof Products, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    SubCategoryNameExist(reqBody: any): Promise<Sub_Categories>;
    createCategory(reqUser: any, createSubCategoryDto: any, fileName: any): Promise<Sub_Categories>;
    allSubCategoryListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Sub_Categorie_listing: {
            created_at: string;
            updated_at: string;
            sub_category_image: string;
            id: number;
            category_id: number;
            category: Categories;
            sub_category_name: number;
            sub_catetgory_slug_url: string;
            description: string;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Sub_Categories;
            dataValues: Sub_Categories;
            _creationAttributes: Sub_Categories;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<Sub_Categories, Sub_Categories>;
        }[];
    }>;
    SubCategoriesById(reqUser: any, id: any): Promise<{
        created_at: string;
        updated_at: string;
        id: number;
        category_id: number;
        category: Categories;
        sub_category_name: number;
        sub_catetgory_slug_url: string;
        sub_category_image: string;
        description: string;
        deleted_at: Date;
        createdAt?: any;
        updatedAt?: any;
        deletedAt?: any;
        version?: any;
        _attributes: Sub_Categories;
        dataValues: Sub_Categories;
        _creationAttributes: Sub_Categories;
        isNewRecord: boolean;
        sequelize: Sequelize;
        _model: import("sequelize").Model<Sub_Categories, Sub_Categories>;
    }>;
    deleteSubCategorie(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Sub_Categories[]]>;
    updateSubCategories(reqUser: any, id: any, reqBody: any, file: any): Promise<[affectedCount: number, affectedRows: Sub_Categories[]]>;
    allSubCategoriesListingVL(reqUser: any): Promise<{
        value: number;
        label: number;
    }[]>;
    SubCategoriesListingVLByID(reqUser: any, id: any): Promise<{
        value: number;
        label: number;
    }[]>;
    getSubcategoryWiseProducts(subCategoryId: any): Promise<{
        value: number;
        label: {
            product: string;
            product_slug: string;
            price: number;
            images: ProductsImage[];
        };
    }[]>;
    ExportExcel(): Promise<ExcelJS.Buffer>;
}
