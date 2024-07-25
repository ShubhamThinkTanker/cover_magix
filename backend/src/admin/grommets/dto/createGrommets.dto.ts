import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';


export class CreateGrommetsDto {
    @Transform(({ value }) => value.trim())
    @IsNotEmpty({
        message: "Grommet Name is required"
    })
    grommet_name: string;

    @Transform(({ value }) => value.trim())
    @IsNotEmpty({
        message: "Price is required"
    })
    price: string;

}

