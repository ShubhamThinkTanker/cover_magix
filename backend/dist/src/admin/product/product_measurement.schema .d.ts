import { Model } from 'sequelize-typescript';
import { Products } from './product.schema';
import { MeasurementData } from './interfaces/product.measurement';
export declare class ProductsMeasurement extends Model<ProductsMeasurement> {
    id: number;
    product_id: number;
    product: Products;
    type: number;
    product_measurement: MeasurementData[];
    extra_material: string;
    material_price: string;
    area_sq_inches: string;
    area_sq_meters: string;
    total_material_sq_meters: string;
    cost: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
