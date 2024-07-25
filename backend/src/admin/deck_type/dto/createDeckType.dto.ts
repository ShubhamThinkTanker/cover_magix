import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';


export class CreateDeckTypeDto {
    @Transform(({ value }) => value.trim()) // Trim whitespace
    @IsNotEmpty({
        message: "Deck Type Name is required"
    })
    deck_name: string;

    @Transform(({ value }) => value.trim())
    @IsNotEmpty({
        message: "Price is required"
    })
    price: string;

}

