import {IsEmail,IsNotEmpty , IsArray, IsString} from 'class-validator';


export class ValidateFabricMaterial {

    @IsNotEmpty({
        message:"Color Name is required"
      })
      color_name : string;

      @IsNotEmpty({
        message:"Color is required"
      })
      color : string;

      @IsNotEmpty({
        message:"Color is required"
      })
      color_suggestions?: string[];

}

