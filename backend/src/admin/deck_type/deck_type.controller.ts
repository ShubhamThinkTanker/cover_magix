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
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  Success,
} from '../../../Helper/commonResponse';
import { DeckTypeService } from './deck_type.service';
import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { S3Service } from '../../../Helper/S3Bucket';
import { ValidateDeckType } from './Validation/deck_type.createValidation';
import { CreateDeckType } from './deck_type.interface';
import { DeckType } from './deck_type.schema';
import { InjectModel } from '@nestjs/sequelize';
import { CreateDeckTypeDto } from './dto/createDeckType.dto';
import { resizeImage } from 'Helper/imageConfigration';

@Controller('deck-type')
export class DeckTypeController {
  constructor(
    @InjectModel(DeckType) private DeckModel: typeof DeckType,
    private readonly s3Service: S3Service,
    private readonly deckService: DeckTypeService,
  ) {}

  isValidMySQLId(id: string): boolean {
    const regex = /^\d+$/;
    return regex.test(id);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('deck_image'))
  async categoriecreate(
    @Body() CreateDeckType: CreateDeckTypeDto,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() deck_image,
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

      var fileName = `${Date.now()}-${deck_image.originalname}`;

      const resizedImageBuffer = await resizeImage(deck_image.buffer, 150, 150);

      const errors = {};
      const deckTypeInput = new ValidateDeckType();
      deckTypeInput.deck_name = CreateDeckType.deck_name;
      deckTypeInput.price = CreateDeckType.price;

      const validation_errors = await validate(deckTypeInput);

      const findGrommetExist =
        await this.deckService.DeckNameExist(CreateDeckType);
      if (findGrommetExist) {
        errors['deck_name'] = 'This Deck Type name is already exist';
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
      //await this.s3Service.uploadFileToS3ForDeck(deck_image, fileName);
      await this.s3Service.uploadFileToS3ForDeck({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
      const createdData = await this.deckService.createDeckType(
        req.user,
        CreateDeckType,
        fileName,
      );
      if (createdData) {
        return new Success(res, 200, createdData, '🎉 Deck Type Created Successfully!');
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
  async getAllDeckList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let Deck_listing = await this.deckService.allDeckListing(
        req.body,
        req.user,
      );

      if (Deck_listing) {
        return new Success(res, 200, Deck_listing, '🎉 All Deck Types Listed Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          Deck_listing,
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
  async getByIdDeckList(
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

      const DeckTypeId = req.params.id;
      if (!this.isValidMySQLId(DeckTypeId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid DeckType id',
          'DeckType id isnot valid',
        );
      }

      const existingDeckType = await this.DeckModel.findOne({ where: { id , deleted_at : null}});
      if (!existingDeckType) {
        return new CustomErrorResponse(
          res,
          500,
          'Grommet not found',
          'GrommetID doesnot found in database',
        );
      }

      const ListData = await this.deckService.DeckById(req.user, DeckTypeId);
      if (ListData) {
        return new Success(res, 200, ListData, '🔍 Deck Type Found Successfully!');
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
  async DeckDeleteById(@Param("id") id: string, @Req() req: any, @Res() res: Response){
    try {

      
      const DeckTypeId = req.params.id;
      if (!this.isValidMySQLId(DeckTypeId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid DeckType id',
          'DeckType id isnot valid',
        );
      }

      const existingDeckType = await this.DeckModel.findOne({ where: { id , deleted_at : null}});
      if (!existingDeckType) {
        return new CustomErrorResponse(
          res,
          500,
          'Grommet not found',
          'GrommetID doesnot found in database',
        );
      }

      const data = await this.deckService.deleteDeck(req.user, id)
      if (data) {
        return new Success(res, 200, {}, "🗑️ Deck Type Deleted Successfully!");
      } else {
        return new CustomResponse(res, 400, data, 'Something went wrong during Serach');
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
    }
  }

  @Get('list_V_L')
  async getAllDeckTypeListValueLabelWise(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let decktype_listing_VL = await this.deckService.allDeckTypeListingVL(req.user); 
    
      if (decktype_listing_VL) {
        return new Success(res, 200, decktype_listing_VL, '📋 All Deck Types Listed Successfully by Label and Value!');
      } else {
        return new CustomResponse(
          res,
          400,
          decktype_listing_VL,
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

  // @Post('update/:id')
  // @UseInterceptors(FileInterceptor('deck_image'))
  // async updateDeckTypeById(
  //   @Param('id') id: string,
  //   @Req() req: any,
  //   @Res() res: Response,
  //   @UploadedFile() deck_image,
  // ) {
  //   try {
  //     // Check user authentication
  //     if (!req.user) {
  //       return new CustomErrorResponse(
  //         res,
  //         401,
  //         'Invalid User login',
  //         'Invalid Login credential',
  //       );
  //     }

  //     const DeckTypeId = req.params.id;
  //     if (!this.isValidMySQLId(DeckTypeId)) {
  //       return new CustomErrorResponse(
  //         res,
  //         404,
  //         'Enter valid DeckType id',
  //         'DeckType id isnot valid',
  //       );
  //     }

  //     const existingDeckType = await this.DeckModel.findOne({ where: { id , deleted_at : null}});
  //     if (!existingDeckType) {
  //       return new CustomErrorResponse(
  //         res,
  //         500,
  //         'DeckType not found',
  //         'DeckTypeID doesnot found in database',
  //       );
  //     }
  //     const resizedImageBuffer = await resizeImage(deck_image.buffer, 150, 150);

  //     // Validate request body
  //     const errors = {};
  //     const deckTypeInput = new ValidateDeckType();
  //     deckTypeInput.deck_name = req.body.deck_name;
  //     deckTypeInput.price = req.body.price;

  //     const validation_errors = await validate(deckTypeInput);

  //     if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
  //       validation_errors.map((error) => {
  //         errors[error['property']] = Object.values(error.constraints)[0];
  //       });

  //       return new CustomErrorResponse(
  //         res,
  //         422,
  //         'Validation Error',
  //         errors,
  //       );
  //     }
      
  //     if (deck_image) {
  //       await this.s3Service.deleteDeckTypeImage(existingDeckType.deck_image);

  //       var fileName = `${Date.now()}-${deck_image.originalname}`;
  //       //const imageUrl = await this.s3Service.uploadFileToS3ForDeck(deck_image, fileName);
  //       await this.s3Service.uploadFileToS3ForDeck({ buffer: resizedImageBuffer, originalname: fileName }, fileName);

  //     }
  //     const updateData = await this.deckService.updateDeckTypes(req.user, DeckTypeId, req.body, fileName);


  //     if (updateData) {
  //       return new Success(res, 200, true, "✨ Deck Type Updated Successfully!");
  //     } else {
  //       return new CustomResponse(res, 400, false, 'Something went wrong during update');
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
  @UseInterceptors(FileInterceptor('deck_image'))
  async updateDeckTypeById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() deck_image,
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

      const DeckTypeId = req.params.id;
      if (!this.isValidMySQLId(DeckTypeId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid DeckType id',
          'DeckType id is not valid',
        );
      }

      const existingDeckType = await this.DeckModel.findOne({ where: { id: DeckTypeId, deleted_at: null } });
      if (!existingDeckType) {
        return new CustomErrorResponse(
          res,
          500,
          'DeckType not found',
          'DeckTypeID does not exist in the database',
        );
      }

      // Validate request body
      const errors = {};
      const deckTypeInput = new ValidateDeckType();
      deckTypeInput.deck_name = req.body.deck_name;
      deckTypeInput.price = req.body.price;

      const validation_errors = await validate(deckTypeInput);

      if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
        validation_errors.forEach((error) => {
          errors[error.property] = Object.values(error.constraints)[0];
        });

        return new CustomErrorResponse(
          res,
          422,
          'Validation Error',
          errors,
        );
      }

      let fileName: string;
      if (deck_image) {
        if (!deck_image.buffer) {
          throw new Error('Invalid file upload');
        }

        const resizedImageBuffer = await resizeImage(deck_image.buffer, 150, 150);
        await this.s3Service.deleteDeckTypeImage(existingDeckType.deck_image);

        fileName = `${Date.now()}-${deck_image.originalname}`;
        await this.s3Service.uploadFileToS3ForDeck({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
      }

      const updateData = await this.deckService.updateDeckTypes(req.user, DeckTypeId, req.body, fileName);

      if (updateData) {
        return new Success(res, 200, true, '✨ Deck Type Updated Successfully!');
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

  
    //Export Excel
    @Get('excel')
    async exportExcel(@Res() res: Response, @Req() req: Request) {
      try {
        //  const filePath = path.join(__dirname, '../../../../DeckTypeList.xlsx');
        const bufferData =await this.deckService.ExportExcel();
  
        return new Success(
          res,
          200,
          bufferData,
          '📋 DeckType Excel Successfully Export!',
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
