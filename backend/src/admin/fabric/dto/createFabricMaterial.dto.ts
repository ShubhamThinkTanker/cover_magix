import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateFabricMaterialDto {
    @Transform(({ value }) => value.trim())
    @IsNotEmpty({
        message: "Color Name is required"
    })
    color_name: string;

    @Transform(({ value }) => value.trim())
    @IsNotEmpty({
        message: "Color is required"
    })
    color: string;


    @IsNotEmpty({
        message: "Fabric ID is required"
    })
    fabric_id: number;

    @IsNotEmpty({
        message: "Fabric ID is required"
    })
    color_suggestions: string[];


}

