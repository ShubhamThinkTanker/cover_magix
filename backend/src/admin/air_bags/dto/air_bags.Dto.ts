import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateAirBagsDto {

    @IsNotEmpty({
        message: "Product ID is required"
    })
    product_id : number;

    @IsString()
    @IsNotEmpty({ message: "Air Bag's size is required" })
    @Transform(({ value }) => value.trim()) // Trim whitespace
    size: string;

    @IsNotEmpty({
        message: "Air Bag's quantity is required"
    })
    quantity : number;

    @IsNotEmpty({
        message: "Air Bag's Price is required"
    })
    price : string;
}