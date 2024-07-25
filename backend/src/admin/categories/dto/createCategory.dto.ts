import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateCategoryDto {
    
    @IsString()
    @IsNotEmpty({ message: "Category Name is required" })
    @Transform(({ value }) => value.trim()) // Trim whitespace
    category_name: string;

    @IsNotEmpty({
        message: "Category Status is required"
    })
    status: number;

    @IsNotEmpty({
        message: "Category Slug url is required"
    })
    category_slug_url: string;

    @IsNotEmpty({
        message: "Category include_store_menu is required"
    })
    include_store_menu: number;

    description: string;

    category_image: string;
}
