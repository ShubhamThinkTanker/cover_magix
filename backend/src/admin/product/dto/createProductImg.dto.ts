import { IsNotEmpty } from 'class-validator';

export class CreateProductImageDto {
  @IsNotEmpty({
    message:"Product ID is required"
  })
  product_id : number;
}
