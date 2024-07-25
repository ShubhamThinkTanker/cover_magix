import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateCategory {

    @IsNotEmpty({
        message:"Category Name is required"
      })
      category_name : string;

      @IsNotEmpty({
        message:"Category Status is required"
      })
      status : number;

      @IsNotEmpty({
        message:"Category include_store_menu is required"
      })
      include_store_menu : number;

      description: string;

      category_image: string;
}




