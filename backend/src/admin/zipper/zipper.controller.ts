import { Zipper } from './zipper.schema';
import { ZipperService } from './zipper.service';
import { AirBagsService } from './../air_bags/air_bags.service';
import { Body, Controller, Get, Param, Post, Put, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateZipperDto } from './dto/zipper.dto';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from 'Helper/commonResponse';
import { Products } from '../product/product.schema';
import { ValidateZipper } from './validation/zipper.createValidation';
import { S3Service } from '../../../Helper/S3Bucket';

import { validate } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectModel } from '@nestjs/sequelize';

@Controller('zipper')
export class ZipperController {
  constructor(
    @InjectModel(Zipper) private zipperModel: typeof Zipper,
    private readonly s3Service: S3Service,
    private readonly ZipperService:ZipperService){}
  
    isValidMySQLId(id: string): boolean {
        const regex = /^\d+$/;
        return regex.test(id);
    }

  @Post('create')
  @UseInterceptors(FileInterceptor('zipper_image'))
    async zippercreate(
        @Body() CreateZipper: CreateZipperDto,
        @Req() req: any,
        @Res() res: Response,
        @UploadedFile() zipper_image,
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

             var fileName = `${Date.now()}-${zipper_image.originalname}`;


            const errors = {};

            const productExists = await Products.findOne({
                where: { id: CreateZipper.product_id, deleted_at: null },
              });
              if (!productExists) {
                errors['product_id'] = 'This Product id does not exist';
                return new CustomResponse(
                  res,
                  400,
                  errors,
                  'Product id does not exist',
                );
              }

              //  const productIdExists = await Zipper.findOne({
              //   where: { product_id: CreateZipper.product_id, deleted_at: null },
              // });

              //   if (productIdExists) {
              //   errors['product_id'] = 'This Product id already exist';
              //   return new CustomResponse(
              //     res,
              //     400,
              //     errors,
              //     'Product id already exist',
              //   );
              // }

            const zipperInput = new ValidateZipper();
            zipperInput.zipper_name = CreateZipper.zipper_name;
            // zipperInput.zipper_image = CreateZipper.zipper_image;

            const validation_errors = await validate(zipperInput);

            const findZipperExist =
        await this.ZipperService.ZipperNameExist(CreateZipper);
      if (findZipperExist) {
        errors['zipper_name'] = 'This Zipper name is already exist';
      }

            if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
                validation_errors.map((error) => {
                    errors[error['property']] = Object.values(error.constraints)[0];
                });

                return new CustomErrorResponse(
                    res,
                    422,
                    'Something went wrong',
                    errors,
                );
            }

            await this.s3Service.uploadFileToS3ForZipper(zipper_image, fileName);
            const createdData = await this.ZipperService.createZipper(
                req.user,
                CreateZipper,
                fileName
            );
            if (createdData) {
                return new Success(
                    res,
                    200,
                    createdData,
                    '🎉 Zipper Created Successfully!',
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

    
  @Get('list/:id')
  async getByIdAirBagsList(
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
      const ZipperId = req.params.id;
      if (!this.isValidMySQLId(ZipperId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Zipper id',
          'Zipper id is not valid',
        );
      }

      const ListData = await this.ZipperService.ZipperById(req.user, id);
      if (!ListData) {
        return new CustomErrorResponse(
          res,
          500,
          'Zipper not found',
          'ZipperId does not found in database',
        );
      }
      return new Success(res, 200, ListData, '🔍 Zipper Found Successfully!');
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
  async getAllZipperList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let Zipper_listing = await this.ZipperService.allZipperListing(
        req.body,
        req.user,
      );

      if (Zipper_listing) {
        return new Success(res, 200, Zipper_listing, '🎉 All Zipper Listed Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          Zipper_listing,
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

  // @Put('update/:id')
  //   async updateZipperById(
  //       @Param('id') id: string,
  //       @Req() req: any,
  //       @Res() res: Response,
  //   ) {
  //       try {
  //           if (!req.user) {
  //               return new CustomErrorResponse(
  //                   res,
  //                   401,
  //                   'Invalid User login',
  //                   'Invalid Login credential',
  //               );
  //           }
  //           const ZipperId = req.params.id;
  //           if (!this.isValidMySQLId(ZipperId)) {
  //               return new CustomErrorResponse(
  //                   res,
  //                   404,
  //                   'Enter valid Zipper id',
  //                   'Zipper id is not valid',
  //               );
  //           }

  //           const existingZipper = await this.ZipperService.ZipperById(req.user, ZipperId);
  //           if (!existingZipper) {
  //               return new CustomErrorResponse(
  //                   res,
  //                   500,
  //                   'Zipper not found',
  //                   'ZipperId does not found in database',
  //               );
  //           }
  //           const errors = {};
  //           const productExists = await Products.findOne({
  //               where: { id: req.body.product_id, deleted_at: null },
  //             });
  //             if (!productExists) {
  //               errors['product_id'] = 'This Product id does not exist';
  //               return new CustomResponse(
  //                 res,
  //                 400,
  //                 errors,
  //                 'Product id does not exist',
  //               );
  //             }
  //           const ZipperInput = new ValidateZipper();
  //           ZipperInput.zipper_name = req.body.zipper_name;
  //           // ZipperInput.zipper_image = req.body.zipper_image;

  //           const validation_errors = await validate(ZipperInput);

  //           if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
  //               validation_errors.map((error) => {
  //                   errors[error['property']] = Object.values(error.constraints)[0];
  //                   // UserController.final_error_object['errors'][error['property']] = Object.values(error.constraints)[0]
  //               });

  //               return new CustomErrorResponse(
  //                   res,
  //                   422,
  //                   'Something went wrong',
  //                   errors,
  //               );
  //           }


  //           const updateData = await this.ZipperService.updateZipper(
  //               req.user,
  //               id,
  //               req.body,
  //           );
  //           if (updateData) {
  //               return new Success(
  //                   res,
  //                   200,
  //                   true,
  //                   '🎊 Zipper Updated Successfully!',
  //               );
  //           } else {
  //               return new CustomResponse(
  //                   res,
  //                   400,
  //                   false,
  //                   'Something went wrong during Search',
  //               );
  //           }
  //       } catch (error) {
  //           console.log('Create Block Error -> ', error);
  //           return new CustomCatchBlockErrorMessage(
  //               res,
  //               500,
  //               error.toString(),
  //               'Something went wrong',
  //           );
  //       }
  //   }


  
  @Post('update/:id')
  @UseInterceptors(FileInterceptor('zipper_image'))
  async updateZipperById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() zipper_image,
  ) {
    try {
      // Check user authentication
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      const ZipperId = req.params.id;
      if (!this.isValidMySQLId(ZipperId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Zipper id',
          'Zipper id is not valid',
        );
      }

      // const existingGrommet = await this.grommetService.GrommetById(req.user, GrommetId);
      // if (!existingGrommet) {
      //   throw new Error('Grommet not found');
      // }
      
      const existingZipper = await this.zipperModel.findOne({ where: { id , deleted_at : null}});
      if (!existingZipper) {
        return new CustomErrorResponse(
          res,
          500,
          'Zipper not found',
          'ZipperID does not found in database',
        );
      }
     
      // Validate request body
      const errors = {};
      const grommetInput = new ValidateZipper();
      grommetInput.zipper_name = req.body.zipper_name;

      const validation_errors = await validate(grommetInput);

      if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
        validation_errors.map((error) => {
          errors[error['property']] = Object.values(error.constraints)[0];
        });

        return new CustomErrorResponse(
          res,
          422,
          'Validation Error',
          errors,
        );
      }

      if (zipper_image) {
        await this.s3Service.deleteZipperImage(existingZipper.zipper_image);

        var fileName = `${Date.now()}-${zipper_image.originalname}`;
        const imageUrl = await this.s3Service.uploadFileToS3ForZipper(zipper_image, fileName);

      }
      const updateData = await this.ZipperService.updateZipper(req.user, ZipperId, req.body, fileName);


      if (updateData) {
        return new Success(res, 200, true, "✨ Zipper Updated Successfully!");
      } else {
        return new CustomResponse(res, 400, false, 'Something went wrong during update');
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
    async ZipperDeleteById(
      @Param('id') id: string,
      @Req() req: any,
      @Res() res: Response,
    ) {
      try {
  
        const ZipperId = req.params.id;
        if (!this.isValidMySQLId(ZipperId)) {
          return new CustomErrorResponse(
            res,
            404,
            'Enter valid Zipper id',
            'Zipper id is not valid',
          );
        }
  
        const existingZipper = await this.ZipperService.ZipperById(req.user, ZipperId);
        if (!existingZipper) {
          return new CustomErrorResponse(
            res,
            500,
            'Zipper not found',
            'ZipperId does not found in database',
          );
        }
  
        const data = await this.ZipperService.deleteZipper(req.user , id);
        if (data) {
          return new Success(
            res,
            200,
            {},
            '🗑️ Zipper Deleted Successfully!',
          );
        } else {
          return new CustomResponse(
            res,
            400,
            data,
            'Something went wrong during Search',
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
async getZipperListValueLabelWiseByID(
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

    const zipperListingVL = await this.ZipperService.ZipperListingVLByID(req.user, id);

    if (zipperListingVL.length > 0) {
      return new Success(
        res,
        200,
        zipperListingVL,
        '📋 Zipper Listed Successfully by Label and Value!',
      );
    } else {
      return new CustomResponse(
        res,
        404,
        zipperListingVL,
        'No zipper found for the provided ID',
      );
    }
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

@Get('list_V_L')
  async getAllZipperListValueLabelWise(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let zipper_listing_VL = await this.ZipperService.allZipperListingVL(req.user); 
    
      if (zipper_listing_VL) {
        return new Success(res, 200, zipper_listing_VL, '📋 All Zippers Listed Successfully by Label and Value!');
      } else {
        return new CustomResponse(
          res,
          400,
          zipper_listing_VL,
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


}
