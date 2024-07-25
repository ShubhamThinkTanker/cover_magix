import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty({
    message: "Category ID is required"
  })
  category_id: number;

  @IsNotEmpty({
    message: "Sub Category ID is required"
  })
  sub_category_id: number;

  @Transform(({ value }) => value.trim()) // Trim whitespace
  @IsNotEmpty({
    message: "Product Name is required"
  })
  product_name: string;

  @Transform(({ value }) => value.trim()) // Trim whitespace
  @IsNotEmpty({
    message: "Product Description is required."
  })
  description: string;

  @IsNotEmpty({
    message: "Product Slug url is required"
  })
  product_slug_url: string;

  @Transform(({ value }) => value.trim()) // Trim whitespace
  @IsNotEmpty({
    message: "Product Price is required."
  })
  product_price: number;

  // @Transform(({ value }) => value.trim()) // Trim whitespace
  // @IsNotEmpty({
  //   message: "Product Sale Price is required."
  // })
  // sale_price: number;

  // @Transform(({ value }) => value.trim()) // Trim whitespace
  // @IsNotEmpty({
  //   message: "Product Retail Price is required."
  // })
  // retail_price: number;


  @Transform(({ value }) => value.trim()) // Trim whitespace
  @IsNotEmpty({
    message: "Product MetaData is required."
  })
  meta_data: string;

  @IsNotEmpty({
    message: "Product MetaData is required."
  })
  rating : number;
}
