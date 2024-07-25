import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';


export class CreateSubCategoryDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({
    message: "Sub Category Name is required"
  })
  sub_category_name: string;

  @IsNotEmpty({
    message: "Sub Category Slug url is required"
  })
  sub_catetgory_slug_url: string;

  @IsNotEmpty({
    message: "Category ID is required"
  })
  category_id: number;

  description: string;
}
