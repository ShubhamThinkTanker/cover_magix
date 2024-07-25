import { Categories } from './categories.schema';
import { Sequelize } from 'sequelize';
import { Sub_Categories } from '../sub_categories/sub_categories.schema';
import { Products } from '../product/product.schema';
import { ProductsImage } from '../product/productImage.schema';
import * as ExcelJS from 'exceljs';
export declare class CategoriesService {
    private categoryModel;
    private SubCategoryModel;
    private ProductModel;
    constructor(categoryModel: typeof Categories, SubCategoryModel: typeof Sub_Categories, ProductModel: typeof Products);
    createCategory(reqUser: any, CreateCategory: any, fileName: string): Promise<Categories>;
    categoryNameExist(reqBody: any): Promise<Categories>;
    allCategoryListing(reqbody: any, reqUser: any): Promise<{
        totalRecords: number;
        Category_listing: {
            created_at: string;
            updated_at: string;
            category_image: string;
            id: number;
            category_name: string;
            category_slug_url: string;
            status: number;
            include_store_menu: number;
            Position: number;
            description: string;
            deleted_at: Date;
            sub_categories: Sub_Categories[];
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Categories;
            dataValues: Categories;
            _creationAttributes: Categories;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<Categories, Categories>;
        }[];
    }>;
    CategoriesById(reqUser: any, id: any): Promise<{
        created_at: string;
        updated_at: string;
        category_image: string;
        id: number;
        category_name: string;
        category_slug_url: string;
        status: number;
        include_store_menu: number;
        Position: number;
        description: string;
        deleted_at: Date;
        sub_categories: Sub_Categories[];
        createdAt?: any;
        updatedAt?: any;
        deletedAt?: any;
        version?: any;
        _attributes: Categories;
        dataValues: Categories;
        _creationAttributes: Categories;
        isNewRecord: boolean;
        sequelize: Sequelize;
        _model: import("sequelize").Model<Categories, Categories>;
    }>;
    updateCategories(reqUser: any, id: any, reqBody: any, file: any): Promise<[affectedCount: number, affectedRows: Categories[]]>;
    deleteCategorie(reqUser: any, id: any): Promise<[affectedCount: number, affectedRows: Categories[]]>;
    allCategoryListingVL(reqUser: any): Promise<{
        value: number;
        label: string;
    }[]>;
    allCategoryListingVLStatus(reqUser: any): Promise<{
        value: string;
        label: string;
    }[]>;
    getCategoryWithSubcategories(reqUser: any, categoryId: any): Promise<{
        value: number;
        label: number;
    }[]>;
    getCategoryWiseSubcategoriesAndProducts(): Promise<{
        all_category: Categories[];
    }>;
    getCategoryWiseSubcategoriesAndProductsByID(categoryId: any): Promise<{
        all_category: {
            category_slug: {
                position: number;
                value: string;
                label: string;
            };
            sub_category: {
                subcategory_slug: {
                    value: number;
                    label: string;
                };
                products: any;
            }[];
        }[];
    }>;
    getCategoryWiseProducts(categoryId: any): Promise<{
        value: number;
        label: {
            product: string;
            product_slug: string;
            price: number;
            images: ProductsImage[];
        };
    }[]>;
    ExportExcel(): Promise<ExcelJS.Buffer>;
    positionWiseListing(type?: number): Promise<any>;
    updateCategoryPositions(body: any): Promise<{
        id: number;
        oldPosition: any;
        newPosition: any;
    }[]>;
    AllCategoriesUserMenuBar(): Promise<any[]>;
}
