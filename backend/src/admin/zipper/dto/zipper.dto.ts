import { IsNotEmpty, IsString } from "class-validator";
import {Transform} from 'class-transformer';

export class CreateZipperDto {

    @IsNotEmpty({
        message: "Product ID is required"
    })
    product_id : number;

    @IsString()
    @IsNotEmpty({ message: "Zipper name is required" })
    @Transform(({ value }) => value.trim()) // Trim whitespace
    zipper_name: string;

    // @IsNotEmpty({
    //     message: "Zipper Image is required"
    // })
    // zipper_image : string;

}