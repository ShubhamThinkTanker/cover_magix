import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    Res, UsePipes
} from '@nestjs/common';
import { AirBagsService } from './air_bags.service';
import {
    CustomCatchBlockErrorMessage,
    CustomErrorResponse,
    CustomResponse,
    Success,
} from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { CreateAirBags } from './air_bags.interface';
import { ValidateAirBags } from './Validation/air_bags.CreateValidation';
import { validate } from 'class-validator';
import { CreateAirBagsDto } from './dto/air_bags.Dto';
import { Products  } from '../product/product.schema';
@Controller('air-bags')
export class AirBagsController {
    constructor(private readonly airBagsService: AirBagsService) { }

    isValidMySQLId(id: string): boolean {
        const regex = /^\d+$/;
        return regex.test(id);
    }

    @Post('create')
    async airbagscreate(
        @Body() CreateAirBags: CreateAirBagsDto,
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

            const errors = {};
            const productExists = await Products.findOne({
                where: { id: CreateAirBags.product_id, deleted_at: null },
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

            const airBagInput = new ValidateAirBags();
            airBagInput.size = CreateAirBags.size;
            airBagInput.quantity = CreateAirBags.quantity;

            const validation_errors = await validate(airBagInput);

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

            // Additional validation for size
            if (!['10" x 10"', '10" x 22"', '22" x 22"'].includes(CreateAirBags.size)) {
                return new CustomErrorResponse(
                    res,
                    422,
                    'Invalid size. Allowed values are: 10" x 10", 10" x 22", 22" x 22".',
                    errors,
                );
            }

            const createdData = await this.airBagsService.createAirBag(
                req.user,
                CreateAirBags,
            );
            if (createdData) {
                return new Success(
                    res,
                    200,
                    createdData,
                    '🎉 AirBags Created Successfully!',
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
      const AirBagId = req.params.id;
      if (!this.isValidMySQLId(AirBagId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid AirBag id',
          'AirBag id isnot valid',
        );
      }

      const ListData = await this.airBagsService.AirBagsById(req.user, id);
      if (!ListData) {
        return new CustomErrorResponse(
          res,
          500,
          'AirBags not found',
          'AirBagID doesnot found in database',
        );
      }
      return new Success(res, 200, ListData, '🔍 AirBags Found Successfully!');
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
  async getAllAirBagsList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let AirBags_listing = await this.airBagsService.allAirBagListing(
        req.body,
        req.user,
      );

      if (AirBags_listing) {
        return new Success(res, 200, AirBags_listing, '🎉 All AirBags Listed Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          AirBags_listing,
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

    @Post('update/:id')
    async updateAirBagsById(
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
            const AirBagId = req.params.id;
            if (!this.isValidMySQLId(AirBagId)) {
                return new CustomErrorResponse(
                    res,
                    404,
                    'Enter valid AirBag id',
                    'AirBag id isnot valid',
                );
            }

            const existingAirBag = await this.airBagsService.AirBagsById(req.user, AirBagId);
            if (!existingAirBag) {
                return new CustomErrorResponse(
                    res,
                    500,
                    'AirBag not found',
                    'AirBagID doesnot found in database',
                );
            }
            const errors = {};
            const productExists = await Products.findOne({
                where: { id: req.body.product_id, deleted_at: null },
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
            const AirBagInput = new ValidateAirBags();
            AirBagInput.size = req.body.size;
            AirBagInput.quantity = req.body.quantity;

            const validation_errors = await validate(AirBagInput);

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

            if (!['10" x 10"', '10" x 22"', '22" x 22"'].includes(AirBagInput.size)) {
                return new CustomErrorResponse(
                    res,
                    422,
                    'Invalid size. Allowed values are: 10" x 10", 10" x 22", 22" x 22".',
                    errors,
                );
            }


            const updateData = await this.airBagsService.updateAirBags(
                req.user,
                id,
                req.body,
            );
            if (updateData) {
                return new Success(
                    res,
                    200,
                    true,
                    '🎊 AirBag Updated Successfully!',
                );
            } else {
                return new CustomResponse(
                    res,
                    400,
                    false,
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
    async AirBagDeleteById(
      @Param('id') id: string,
      @Req() req: any,
      @Res() res: Response,
    ) {
      try {
  
        const AirBagId = req.params.id;
        if (!this.isValidMySQLId(AirBagId)) {
          return new CustomErrorResponse(
            res,
            404,
            'Enter valid AirBag id',
            'AirBag id isnot valid',
          );
        }
  
        const existingAirBag = await this.airBagsService.AirBagsById(req.user, AirBagId);
        if (!existingAirBag) {
          return new CustomErrorResponse(
            res,
            500,
            'AirBag not found',
            'AirBagID doesnot found in database',
          );
        }
  
        const data = await this.airBagsService.deleteAirBag(req.user,id);
        if (data) {
          return new Success(
            res,
            200,
            {},
            '🗑️ AirBag Deleted Successfully!',
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

    @Get('list_V_L_ByID/:id')
async getAirbagsListValueLabelWiseByID(
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

    const airBagsListingVL = await this.airBagsService.AirBagsListingVLByID(req.user, id);

    if (airBagsListingVL.length > 0) {
      return new Success(
        res,
        200,
        airBagsListingVL,
        '📋 AirBags Listed Successfully by Label and Value!',
      );
    } else {
      return new CustomResponse(
        res,
        404,
        airBagsListingVL,
        'No airbags found for the provided ID',
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

 //Export Excel
 @Get('excel')
 async exportExcel(@Res() res: Response, @Req() req: Request) {
   try {
    
     const bufferData = await this.airBagsService.ExportExcel();

     return new Success(
       res,
       200,
       bufferData,
       '📋 AirBags Excel Successfully Export!',
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
