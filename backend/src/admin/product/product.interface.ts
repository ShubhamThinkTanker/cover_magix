export class CreateProduct {
    product_name: string;
    description : string;
    product_price :string;
    meta_data : string;
    created_at: Date; // Added created_at field
  }

  export class CreateProductImage {
    product_id: number;
    product_image: string;
    created_at: Date;
  
    constructor(product_id:number, product_image: string, created_at: Date) {
      this.product_id = this.product_id;
        this.product_image = product_image;
        this.created_at = created_at;
    }
  }