import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';


export class ValidateProduct {

  @IsNotEmpty({
    message: "Product Name is required"
  })
  product_name: string;

  @IsNotEmpty({
    message: "Product Slug is required"
  })
  product_slug_url: string;

  @IsNotEmpty({
    message: "Category ID is required"
  })
  category_id: number;

  @IsNotEmpty({
    message: "Sub Category ID is required"
  })
  sub_category_id: number;

  @IsNotEmpty({
    message: "Product Description is required."
  })
  description: string;

  @IsNumber({}, {
    message: "Product Price must be a number."
  })
  @IsNotEmpty({
    message: "Product Price is required."
  })
  product_price: number;

  // @IsNotEmpty({
  //   message: "Product Sale Price is required."
  // })
  // sale_price: number;

  // @IsNotEmpty({
  //   message: "Product Retail Price is required."
  // })
  // retail_price: number;


  // @IsNotEmpty({
  //   message: "Product MetaData is required."
  // })
  // meta_data: string;

  rating: number;
}
