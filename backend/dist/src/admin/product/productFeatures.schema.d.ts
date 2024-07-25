import { Model } from 'sequelize-typescript';
import { Products } from './product.schema';
import { FabricsMaterial } from '../fabric/fabricMaterial.schema';
import { Tie_Down } from '../tie_downs/tie_downs.schema';
import { Grommets } from '../grommets/grommets.schema';
export declare class ProductsFeatures extends Model<ProductsFeatures> {
    id: number;
    product_id: number;
    product: Products;
    fabric_id: number[];
    fabric: FabricsMaterial;
    tie_down_id: number[];
    tie_down: Tie_Down;
    grommet_id: number[];
    grommet: Grommets;
    meta_data: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
