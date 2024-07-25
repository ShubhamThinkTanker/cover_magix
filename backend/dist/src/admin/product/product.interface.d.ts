export declare class CreateProduct {
    product_name: string;
    description: string;
    product_price: string;
    meta_data: string;
    created_at: Date;
}
export declare class CreateProductImage {
    product_id: number;
    product_image: string;
    created_at: Date;
    constructor(product_id: number, product_image: string, created_at: Date);
}
