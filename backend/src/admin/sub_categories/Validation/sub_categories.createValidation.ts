import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateSubCategory {

    @IsNotEmpty({
        message:"Sub Category Name is required"
      })
      sub_category_name : string;

      description: string;
}
