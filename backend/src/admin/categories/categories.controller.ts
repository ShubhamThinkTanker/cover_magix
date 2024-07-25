import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res, UsePipes,
  Query,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  Success,
} from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { CreateCategory } from './categories.interface';
import { ValidateCategory } from './Validation/categories.createValidation';
import { validate } from 'class-validator';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { S3Service } from '../../../Helper/S3Bucket';
import { Categories } from './categories.schema';
import { InjectModel } from '@nestjs/sequelize';
// import { TrimPipe } from './pipes/trim.pipe';

class UpdatePositionDto {
  id: number;
  oldPosition: number;
  newPosition: number;
}

@Controller('categories')
export class CategoriesController {
  constructor(
    @InjectModel(Categories) private categoryModel: typeof Categories,
    private readonly s3Service: S3Service,
    private readonly categoryService: CategoriesService,
  ) { }

  isValidMySQLId(id: string): boolean {
    const regex = /^\d+$/;
    return regex.test(id);
  }

  // @Post('create')
  // // @UsePipes(new TrimPipe())
  // async categoriecreate(
  //   @Body() CreateCategory: any,
  //   @Req() req: any,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     if (!req.user) {
  //       return new CustomErrorResponse(
  //         res,
  //         401,
  //         'Invalid User login',
  //         'Invalid Login credential',
  //       );
  //     }

  //     const errors = {};
  //     const categoryInput = new ValidateCategory();
  //     categoryInput.category_name = CreateCategory.category_name;
  //     categoryInput.include_store_menu = CreateCategory.include_store_menu;
  //     categoryInput.status = CreateCategory.status;
  //     categoryInput.description = CreateCategory.description;

  //     const validation_errors = await validate(categoryInput);

  //     const findCategoryExist =
  //       await this.categoryService.categoryNameExist(CreateCategory);
  //     if (findCategoryExist) {
  //       errors['category_name'] = 'This Category name is already exist';
  //     }
  //     if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
  //       validation_errors.map((error) => {
  //         errors[error['property']] = Object.values(error.constraints)[0];
  //         // UserController.final_error_object['errors'][error['property']] = Object.values(error.constraints)[0]
  //       });

  //       return new CustomErrorResponse(
  //         res,
  //         422,
  //         'Something went wrong',
  //         errors,
  //       );
  //     }

  //     const createdData = await this.categoryService.createCategory(
  //       req.user,
  //       CreateCategory,
  //     );
  //     if (createdData) {
  //       return new Success(
  //         res,
  //         200,
  //         createdData,
  //         '🎉 Category Created Successfully!',
  //       );
  //     } else {
  //       return new CustomResponse(
  //         res,
  //         400,
  //         createdData,
  //         'Something went wrong during creation',
  //       );
  //     }
  //   } catch (error) {
  //     console.log('Create Block Error -> ', error);
  //     return new CustomCatchBlockErrorMessage(
  //       res,
  //       500,
  //       error.toString(),
  //       'Something went wrong',
  //     );
  //   }
  // }


  @Post('create')
  @UseInterceptors(FileInterceptor('category_image'))
  async categoriecreate(
    @Body() CreateCategory: any,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() category_image: Express.Multer.File,
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

      if (!category_image || !category_image.originalname) {
        return new CustomErrorResponse(
          res,
          400,
          'No file provided or file missing originalname',
          'File upload error',
        );
      }

      const fileName = `${Date.now()}-${category_image.originalname}`;

      const errors = {};
      const categoryInput = new ValidateCategory();
      categoryInput.category_name = CreateCategory.category_name;
      categoryInput.include_store_menu = CreateCategory.include_store_menu;
      categoryInput.status = CreateCategory.status;
      categoryInput.description = CreateCategory.description;

      const validation_errors = await validate(categoryInput);

      const findCategoryExist = await this.categoryService.categoryNameExist(CreateCategory);
      if (findCategoryExist) {
        errors['category_name'] = 'This Category name already exists';
      }
      if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
        validation_errors.forEach((error) => {
          errors[error.property] = Object.values(error.constraints)[0];
        });

        return new CustomErrorResponse(
          res,
          422,
          'Something went wrong',
          errors,
        );
      }

      await this.s3Service.uploadFileToS3CategoryAndSubCategory(category_image, fileName);
      const createdData = await this.categoryService.createCategory(
        req.user,
        CreateCategory,
        fileName,
      );

      if (createdData) {
        return new Success(
          res,
          200,
          createdData,
          '🎉 Category Created Successfully!',
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
  async getAllCategoryList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let category_listing = await this.categoryService.allCategoryListing(
        req.body,
        req.user,
      );

      if (category_listing) {
        return new Success(res, 200, category_listing, '🎉 All Categories Listed Successfully!');
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
  async getByIdCategoriesList(
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
      const CategoryId = req.params.id;
      if (!this.isValidMySQLId(CategoryId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Category id',
          'Category id isnot valid',
        );
      }

      const ListData = await this.categoryService.CategoriesById(req.user, id);
      if (!ListData) {
        return new CustomErrorResponse(
          res,
          500,
          'Grommet not found',
          'GrommetID doesnot found in database',
        );
      }
      return new Success(res, 200, ListData, '🔍 Category Found Successfully!');
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

  // @Post('update/:id')
  // @UseInterceptors(FileInterceptor('category_image'))
  // async updateCategoriesById(
  //   @Param('id') id: string,
  //   @Req() req: any,
  //   @Res() res: Response,
  //   @UploadedFile() category_image: Express.Multer.File,
  // ) {
  //   try {
  //     if (!req.user) {
  //       return new CustomErrorResponse(
  //         res,
  //         401,
  //         'Invalid User login',
  //         'Invalid Login credential',
  //       );
  //     }
  //     const CategoryId = req.params.id;
  //     if (!this.isValidMySQLId(CategoryId)) {
  //       return new CustomErrorResponse(
  //         res,
  //         404,
  //         'Enter valid Category id',
  //         'Category id isnot valid',
  //       );
  //     }

  //     const existingCategory = await this.categoryService.CategoriesById(req.user, CategoryId);
  //     if (!existingCategory) {
  //       return new CustomErrorResponse(
  //         res,
  //         500,
  //         'Category not found',
  //         'CategoryID doesnot found in database',
  //       );
  //     }
  //     const errors = {};
  //     const categoryInput = new ValidateCategory();
  //     categoryInput.category_name = req.body.category_name;
  //     categoryInput.status = req.body.status;
  //     categoryInput.include_store_menu = req.body.include_store_menu;

  //     const validation_errors = await validate(categoryInput);

  //     if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
  //       validation_errors.map((error) => {
  //         errors[error['property']] = Object.values(error.constraints)[0];
  //         // UserController.final_error_object['errors'][error['property']] = Object.values(error.constraints)[0]
  //       });

  //       return new CustomErrorResponse(
  //         res,
  //         422,
  //         'Something went wrong',
  //         errors,
  //       );
  //     }

  //     var fileName = `${Date.now()}-${category_image.originalname}`;
  //     await this.s3Service.uploadFileToS3CategoryAndSubCategory(category_image, fileName);

  //     const updateData = await this.categoryService.updateCategories(
  //       req.user,
  //       id,
  //       req.body,
  //       fileName
  //     );
  //     if (updateData) {
  //       return new Success(
  //         res,
  //         200,
  //         true,
  //         '🎊 Category Updated Successfully!',
  //       );
  //     } else {
  //       return new CustomResponse(
  //         res,
  //         400,
  //         false,
  //         'Something went wrong during Serach',
  //       );
  //     }
  //   } catch (error) {
  //     console.log('Create Block Error -> ', error);
  //     return new CustomCatchBlockErrorMessage(
  //       res,
  //       500,
  //       error.toString(),
  //       'Something went wrong',
  //     );
  //   }
  // }


  @Post('update/:id')
  @UseInterceptors(FileInterceptor('category_image'))
  async updateCategoriesById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() category_image: Express.Multer.File,
  ) {
    try {
      // Check if the user is logged in
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }
  
      const CategoryId = req.params.id;
  
      // Validate Category ID
      if (!this.isValidMySQLId(CategoryId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Category id',
          'Category id is not valid',
        );
      }
  
      // Check if the category exists
      const existingCategory = await this.categoryService.CategoriesById(req.user, CategoryId);
      if (!existingCategory) {
        return new CustomErrorResponse(
          res,
          500,
          'Category not found',
          'Category ID does not found in database',
        );
      }
  
      // Handle the uploaded file if exists
      let fileName = existingCategory.category_image;
      if (category_image) {
        fileName = `${Date.now()}-${category_image.originalname}`;
        await this.s3Service.uploadFileToS3CategoryAndSubCategory(category_image, fileName);
      }
  
      // Update the category with the provided data
      const updateData = await this.categoryService.updateCategories(
        req.user,
        id,
        req.body,
        fileName 
      );
  
      if (updateData) {
        return new Success(
          res,
          200,
          true,
          '🎊 Category Updated Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          false,
          'Something went wrong during update',
        );
      }
    } catch (error) {
      console.log('Update Category Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('delete/:id')
  async categorieDeleteById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {

      const CategoryId = req.params.id;
      if (!this.isValidMySQLId(CategoryId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Category id',
          'Category id isnot valid',
        );
      }

      const existingCategory = await this.categoryService.CategoriesById(req.user, CategoryId);
      if (!existingCategory) {
        return new CustomErrorResponse(
          res,
          500,
          'Category not found',
          'CategoryID doesnot found in database',
        );
      }

      const data = await this.categoryService.deleteCategorie(req.user, id);
      if (data) {
        return new Success(
          res,
          200,
          {},
          '🗑️ Category Deleted Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          data,
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

  @Get('list_V_L')
  async getAllCategoryListValueLabelWise(
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

      let category_listing_VL = await this.categoryService.allCategoryListingVL(
        req.user,
      );

      if (category_listing_VL) {
        return new Success(
          res,
          200,
          category_listing_VL,
          '📋 All Categories Listed Successfully by Label and Value!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          category_listing_VL,
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


  @Get('list_V_L_Status')
  async getAllCategoryListValueLabelWiseWithStatus(
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

      let category_listing_VL = await this.categoryService.allCategoryListingVLStatus(
        req.user,
      );

      if (category_listing_VL) {
        return new Success(
          res,
          200,
          category_listing_VL,
          '📋 All Categories Listed Successfully by Label and Value With Status!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          category_listing_VL,
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

  @Post('list_V_L_subcategory')
  async getAllCategoryListValueLabelWiseWithSubCategories(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      const { category_id } = req.body;
      if (!category_id) {
        return new CustomErrorResponse(
          res,
          400,
          'Missing category_id',
          'Please provide a category_id in the request body',
        );
      }

      let categoryWithSubcategories = await this.categoryService.getCategoryWithSubcategories(req.user, category_id);

      if (categoryWithSubcategories) {
        return new Success(res, 200, categoryWithSubcategories, '📋 Category with Subcategories Listed Successfully by Label and Value!');
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

  // @Post('updatePositions')
  // async updateCategoryPositions(
  //   @Body() positions: any,
  //   @Req() req: any,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     if (!req.user) {
  //       return new CustomErrorResponse(
  //         res,
  //         401,
  //         'Invalid User login',
  //         'Invalid Login credential',
  //       );
  //     }

  //     // Ensure the body contains valid data
  //     if (!positions || typeof positions !== 'object') {
  //       return new CustomErrorResponse(
  //         res,
  //         400,
  //         'Invalid data',
  //         'Please provide valid JSON data for updating positions',
  //       );
  //     }

  //     const result = await this.categoryService.updateCategoryPositions(positions);

  //     return new Success(res, 200, true, '📋 Category positions updated successfully!');
  //   } catch (error) {
  //     console.log('Error updating category positions -> ', error);
  //     return new CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
  //   }
  // }

  @Get('list_V_L_All_categories')
  async getCategoryWiseSubcategoriesAndProducts(@Req() req: any, @Res() res: Response) {
    try {
      let categoryWithSubcategories = await this.categoryService.getCategoryWiseSubcategoriesAndProducts();

      if (categoryWithSubcategories) {
        return new Success(res, 200, categoryWithSubcategories, '📋 Category with Subcategories Listed Successfully by Label and Value!');
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

  @Post('list_V_L_categories_Products')
  async getCategoryWiseSubcategoriesAndProductsById(@Req() req: any, @Res() res: Response) {
    try {
      const { category_id } = req.body;
      if (!category_id) {
        return new CustomErrorResponse(
          res,
          400,
          'Missing category_id',
          'Please provide a category_id in the request body',
        );
      }
      let categoryWithSubcategories = await this.categoryService.getCategoryWiseSubcategoriesAndProductsByID(category_id);

      if (categoryWithSubcategories) {
        return new Success(res, 200, categoryWithSubcategories, '📋 Category with Subcategories Listed Successfully by Label and Value!');
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

  @Post('list_V_L_Products')
  async getAllCategoryListValueLabelWiseWithProducts(@Req() req: any, @Res() res: Response) {
    try {
      const { category_id } = req.body;
      if (!category_id) {
        return new CustomErrorResponse(
          res,
          400,
          'Missing category_id',
          'Please provide a category_id in the request body',
        );
      }

      let categoryWithProducts = await this.categoryService.getCategoryWiseProducts(category_id);

      if (categoryWithProducts) {
        return new Success(res, 200, categoryWithProducts, '📋 Category with Products Listed Successfully by Label and Value!');
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

  //Export Excel
  @Get('excel')
  async exportExcel(@Res() res: Response, @Req() req: Request) {
    try {
      // const filePath = path.join(__dirname, '../../../../CategoryList.xlsx');
      const bufferData = await this.categoryService.ExportExcel();

      return new Success(
        res,
        200,
        bufferData,
        '📋 Category Excel Successfully Export!',
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

  @Get('position/listing')
  async getCategories(@Query('type') type: number) {
    const typeNum = Number(type);
    return this.categoryService.positionWiseListing(typeNum);
  }

  @Post('update-positions') // Change to @Patch
  updatePositions(@Req() req: any, @Res() res: Response) {
    // Call the service method to update category positions
    this.categoryService.updateCategoryPositions(req.body);
    return new Success(
      res,
      200,
      {},
      '📋 Category updateed Successfully!',
    );
  }

  @Get('Listing-menu-user')
  async listingAllCategoriesForUserWesite(@Req() req: any, @Res() res: Response){
    try {

      var findAllCategories = await this.categoryService.AllCategoriesUserMenuBar()
      return new Success(
        res,
        200,
        findAllCategories,
        '🎉 Categories Retrieved Successfully! 📋'
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
