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
  UploadedFiles,
} from '@nestjs/common';
import { PromoCodeService } from './promo_code.service';
import { CreatePromoDto } from './dto/promo_code.dto';
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  Success,
} from 'Helper/commonResponse';

import { Products } from '../product/product.schema';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { validate } from 'class-validator';
import { ValidatePromoCode } from './validation/promocode.validation';

@Controller('promo_code')
export class PromoCodeController {
  constructor(
    private readonly promoService: PromoCodeService,
    @InjectModel(Products)
    private readonly productModel: typeof Products,
    // private readonly s3Service: S3Service,
  ) {}

  isValidMySQLId(id: string): boolean {
    const regex = /^\d+$/;
    return regex.test(id);
  }


  @Post('create')
  async promoCreate(
    @Body() CreatePromo: CreatePromoDto,
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

      var findSameNamePromo = await this.promoService.findNamePromo(
        req.body.code,
      );
      if (findSameNamePromo) {
        return new CustomErrorResponse(
          res,
          400,
          'This promo code already exists. Please use a different name.',
          'Something went wrong during creation',
        );
      }

      const promoType = req.body.promo_type;
      const itemIds = req.body.itemId;

      if (promoType === 'cat' || promoType === 'sub_cat') {
        const field = promoType === 'cat' ? 'category_id' : 'sub_category_id';

        const findProduct = await this.productModel.findAll({
          where: {
            [field]: {
              [Op.in]: itemIds,
            },
          },
          attributes: ['id'],
          raw: true,
        });

        const productIds = findProduct.map((product) => product.id);
        req.body.productIds = Array.from(new Set(productIds));
      } else if (promoType === 'pro') {
        req.body.productIds = itemIds;
      }

      const createdData = await this.promoService.createPromo(
        req.user,
        req.body,
      );
      if (createdData) {
        return new Success(
          res,
          200,
          createdData,
          '🌟 Your Promo Code Offer has been successfully Genrate! 🌟',
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
      console.log(error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Get('header_promo')
  async headerPromoGet(@Req() req: any, @Res() res: Response) {
    try {
      console.log(':header_promo');

      var findHeaderPromoCode = await this.promoService.findHeaderPromo()

      if (findHeaderPromoCode) {
        return new Success(
          res,
          200,
          findHeaderPromoCode,
          '🌟 Your Header Promo Code Get! 🌟',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          findHeaderPromoCode,
          'Something went wrong during creation',
        );
      }
    } catch (error) {
      console.log(error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('list')
  async getAllPromoCodeList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let promocode_listing = await this.promoService.allPromoCodesListing(
        req.body,
        req.user,
      );

      if (promocode_listing) {
        return new Success(res, 200, promocode_listing, '🎉 All PromoCodes Listed Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          promocode_listing,
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
  async getByIdPromoCodeList(
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
      const PromoCodeId = req.params.id;
      if (!this.isValidMySQLId(PromoCodeId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid PromoCode id',
          'PromoCode id isnot valid',
        );
      }

      const ListData = await this.promoService.PromocodeById(req.user, id);
      if (!ListData) {
        return new CustomErrorResponse(
          res,
          500,
          'PromoCode not found',
          'PromoCodeID doesnot found in database',
        );
      }
      return new Success(res, 200, ListData, '🔍 PromoCode Found Successfully!');
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
  async updatePromoCodeId(
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

      const PromoCodeId = req.params.id;
      if (!this.isValidMySQLId(PromoCodeId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Promo Code id',
          'promo Code id isnot valid',
        );
      }

      const existingPromoCode = await this.promoService.PromocodeById(
        req.user,
        PromoCodeId
      );
      if (!existingPromoCode) {
        return new CustomErrorResponse(
          res,
          500,
          'PromoCode not found',
          'Promo code ID doesnot found in database',
        );
      }

      const errors = {};
      const productInput = new ValidatePromoCode();
      productInput.promo_type = req.body.promo_type;
      productInput.code = req.body.code;
      productInput.header_Promo = req.body.header_Promo;
      productInput.description = req.body.description;
      productInput.max_user = req.body.max_user;
      productInput.status = req.body.status;
      productInput.end_date = req.body.end_date;
      productInput.start_date = req.body.start_date;
      productInput.discount_per = req.body.discount_per;

      const validation_errors = await validate(productInput);

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

      const updateData = await this.promoService.updatePromoCode(
        req.user,
        id,
        req.body,
      );
      if (updateData) {
        return new Success(res, 200, true, '🎊 Promo Code Updated Successfully!');
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
  async PromoDeleteById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {

      const PromoId = req.params.id;
      if (!this.isValidMySQLId(PromoId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Promo id',
          'Promo id isnot valid',
        );
      }

      const existingPromo = await this.promoService.deletePromoById(req.user, PromoId);
      if (!existingPromo) {
        return new CustomErrorResponse(
          res,
          500,
          'Promo code not found',
          'Promo code doesnot found in database',
        );
      }

      const data = await this.promoService.deletePromoById(req.user,id);
      if (data) {
        return new Success(
          res,
          200,
          {},
          '🗑️ Promo Code Deleted Successfully!',
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
}
