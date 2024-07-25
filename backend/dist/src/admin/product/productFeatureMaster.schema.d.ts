import { Model } from 'sequelize-typescript';
import { Products } from './product.schema';
import { CustomField } from './interfaces/productFeaturesInterface';
export declare class ProductsFeaturesMaster extends Model<ProductsFeaturesMaster> {
    id: number;
    product_id: number;
    product: Products;
    modules: string[];
    features: string[];
    custom_fields: CustomField[];
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
