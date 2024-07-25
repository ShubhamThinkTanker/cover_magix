import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SubCategoriesService } from './sub_categories.service';
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  Success,
} from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { CreateSubCategory } from './sub_categories.interface';
import { ValidateSubCategory } from './Validation/sub_categories.createValidation';
import { validate } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { CreateSubCategoryDto } from './dto/createSubCategories.dto';
import { InjectModel } from '@nestjs/sequelize';
import { S3Service } from '../../../Helper/S3Bucket';
import { Sub_Categories } from './sub_categories.schema';

@Controller('sub-categories')
export class SubCategoriesController {
  constructor(
   // @InjectModel(subcategories) private SubcategoryModel: typeof Sub_Categories,
    private readonly s3Service: S3Service,
    private readonly subCategoryService: SubCategoriesService
  ) {}

  isValidMySQLId(id: string): boolean {
    const regex = /^\d+$/;
    return regex.test(id);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('sub_category_image'))
  async Subcategoriecreate(
    @Body() CreateSubCategory: any,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() sub_category_image: Express.Multer.File,
  ) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      if (!sub_category_image || !sub_category_image.originalname) {
        return new CustomErrorResponse(
          res,
          400,
          'No file provided or file missing originalname',
          'File upload error',
        );
      }

      const fileName = `${Date.now()}-${sub_category_image.originalname}`;


      const errors = {};
      const subcategoryInput = new ValidateSubCategory();
      subcategoryInput.sub_category_name = CreateSubCategory.sub_category_name;
      subcategoryInput.description = CreateSubCategory.description;

      const validation_errors = await validate(subcategoryInput);

      const findSubCategoryExist =
        await this.subCategoryService.SubCategoryNameExist(subcategoryInput);
      if (findSubCategoryExist) {
        errors['sub_category_name'] = 'This Sub Category name is already exist';
      }
      if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
        validation_errors.map((error) => {
          errors[error['property']] = Object.values(error.constraints)[0];
          // UserController.final_error_object['errors'][error['property']] = Object.values(error.constraints)[0]
        });

        return new CustomErrorResponse(
          res,
          422,
          'Something went wrong',
          errors,
        );
      }

      await this.s3Service.uploadFileToS3CategoryAndSubCategory(sub_category_image, fileName);
      const createdData = await this.subCategoryService.createCategory(
        req.user,
        CreateSubCategory,
        fileName
      );
      if (createdData) {
        return new Success(
          res,
          200,
          createdData,
          '🎉 Subcategory Created Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          createdData,
          'Something went wrong during creation',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('list')
  async getAllSubCategoryList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let category_listing =
        await this.subCategoryService.allSubCategoryListing(req.body, req.user);

      if (category_listing) {
        return new Success(
          res,
          200,
          category_listing,
          '🎉 All Subcategories Listed Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          category_listing,
          'Something went wrong',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Get('list/:id')
  async getByIdSubCategoriesList(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      const subCategoryID = req.params.id;
      if (!this.isValidMySQLId(subCategoryID)) {
        return res.status(404).json({ message: 'Enter valid SubCategory id' });
      }

      const ListData = await this.subCategoryService.SubCategoriesById(req.user, subCategoryID);
      if (!ListData) {
        return res.status(404).json({ message: 'Sub Category not found' });
      }
      if (ListData) {
        return new Success(res, 200, ListData, '🔍 Subcategory Found Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          ListData,
          'Something went wrong during Serach',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('delete/:id')
  async SubcategorieDeleteById(@Param("id") id: string, @Req() req: any, @Res() res: Response){
    try {
      const subCategoryID = req.params.id;
      if (!this.isValidMySQLId(subCategoryID)) {
        return res.status(404).json({ message: 'Enter valid SubCategory id' });
      }

      const existingUser = await this.subCategoryService.SubCategoriesById(req.user, subCategoryID);
      if (!existingUser) {
        return res.status(404).json({ message: 'Sub Category not found' });
      }

      const data = await this.subCategoryService.deleteSubCategorie(req.user, id)
      if (data) {
        return new Success(res, 200, {} , "🗑️ Subcategory Deleted Successfully!");
      } else {
        return new CustomResponse(res, 400, data, 'Something went wrong during Serach');
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
    }
  }

  @Post('update/:id')
  @UseInterceptors(FileInterceptor('sub_category_image'))
  async updateCategoriesById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() sub_category_image: Express.Multer.File,
  ) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      const errors = {};
      const categoryInput = new ValidateSubCategory();
      categoryInput.sub_category_name = req.body.sub_category_name;

      const validation_errors = await validate(categoryInput);

      if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
        validation_errors.map((error) => {
          errors[error['property']] = Object.values(error.constraints)[0];
          // UserController.final_error_object['errors'][error['property']] = Object.values(error.constraints)[0]
        });

        return new CustomErrorResponse(
          res,
          422,
          'Something went wrong',
          errors,
        );
      }

      const subCategoryID = req.params.id;
      if (!this.isValidMySQLId(subCategoryID)) {
        return res.status(404).json({ message: 'Enter valid SubCategory id' });
      }

      const existingUser = await this.subCategoryService.SubCategoriesById(req.user, subCategoryID);
      if (!existingUser) {
        return res.status(404).json({ message: 'Sub Category not found' });
      }

      var fileName = `${Date.now()}-${sub_category_image.originalname}`;
      await this.s3Service.uploadFileToS3CategoryAndSubCategory(sub_category_image, fileName);

      const updateData = await this.subCategoryService.updateSubCategories(req.user , id , req.body, fileName)
      if (updateData) {
        return new Success(res, 200, true, "🎊 Subcategory Updated Successfully!");
      } else {
        return new CustomResponse(res, 400, false, 'Something went wrong during Serach');
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Get('list_V_L')
  async getAllSubcategoryListValueLabelWise(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let subcategories_listing_VL = await this.subCategoryService.allSubCategoriesListingVL(req.user); 
    
      if (subcategories_listing_VL) {
        return new Success(res, 200, subcategories_listing_VL, '📋 All Subcategories Listed Successfully by Label and Value!');
      } else {
        return new CustomResponse(
          res,
          400,
          subcategories_listing_VL,
          'Something went wrong',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Get('list_V_L_ByID/:id')
  async getSubcategoryListValueLabelWiseByID(@Param('id') id: string,
  @Req() req: any,
  @Res() res: Response,) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let subcategories_listing_VL = await this.subCategoryService.SubCategoriesListingVLByID(req.user,id); 
    
      if (subcategories_listing_VL) {
        return new Success(res, 200, subcategories_listing_VL, '📋 Subcategory Listed Successfully by Label and Value!');
      } else {
        return new CustomResponse(
          res,
          400,
          subcategories_listing_VL,
          'Something went wrong',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  
  @Post('list_V_L_SubCategory_Products')
  async getAllSubCategoryListValueLabelWiseWithProducts(@Req() req: any, @Res() res: Response) {
    try {
      const { sub_category_id } = req.body;
      if (!sub_category_id) {
        return new CustomErrorResponse(
          res,
          400,
          'Missing sub category id',
          'Please provide a sub category id in the request body',
        );
      }

      let subCategoryWithProducts = await this.subCategoryService.getSubcategoryWiseProducts(sub_category_id);

      if (subCategoryWithProducts) {
        return new Success(res, 200, subCategoryWithProducts, '📋 Sub Category with Products Listed Successfully by Label and Value!');
      } else {
        return new CustomErrorResponse(
          res,
          500,
          'Internal Server Error',
          'Something went wrong in fetching category with subcategories',
        );
      }
    } catch (error) {
      console.log('Controller Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

     // Export Excel
     @Get('excel')
     async exportExcel(@Res() res: Response, @Req() req: Request) {
       try {
          // const filePath = path.join(__dirname, '../../../../SubCategoryList.xlsx');
        const bufferData = await this.subCategoryService.ExportExcel();
         
         return new Success(
          res,
          200,
          bufferData,
          '📋 SubCategory Excel Successfully Export!',
        );
         
       } catch (error) {
         console.error('Error:', error);
         return new CustomCatchBlockErrorMessage(
           res,
           500,
           error.toString(),
           'Something went wrong',
         );
       }
     }
    
   

}
