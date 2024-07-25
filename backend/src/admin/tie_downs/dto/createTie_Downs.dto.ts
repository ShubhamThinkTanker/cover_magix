import { Transform } from 'class-transformer';
import {IsEmail,IsNotEmpty} from 'class-validator';


export class CreateTie_DownsDto {

    @Transform(({ value }) => value.trim())
    @IsNotEmpty({
        message:"Tie Down Name is required"
      })
      tie_down_name : string;

      @Transform(({ value }) => value.trim())
      @IsNotEmpty({
        message:"Price is required"
      })
      price : string;

}

