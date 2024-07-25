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
import { TieDownsService } from './tie_downs.service';
import { Request, Response } from 'express';
import { CreateTie_Downs } from './tie_downs.interface';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { S3Service } from '../../../Helper/S3Bucket';
import { ValidateTieDown } from './Validation/tie_downs.createValidation';
import { validate } from 'class-validator';
import { Tie_Down } from './tie_downs.schema';
import { InjectModel } from '@nestjs/sequelize';
import { CreateTie_DownsDto } from './dto/createTie_Downs.dto';
import { resizeImage } from 'Helper/imageConfigration';

@Controller('tie-downs')
export class TieDownsController {
  constructor(
    @InjectModel(Tie_Down) private tieDownModel: typeof Tie_Down,
    private readonly s3Service: S3Service,
    private readonly tieDownService: TieDownsService,
  ) {}

  isValidMySQLId(id: string): boolean {
    const regex = /^\d+$/;
    return regex.test(id);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('tie_down_image'))
  async TieDowncreate(
    @Body() CreateTieDown: CreateTie_DownsDto,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() tie_down_image,
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

      var fileName = `${Date.now()}-${tie_down_image.originalname}`;

      const resizedImageBuffer = await resizeImage(tie_down_image.buffer, 150, 150);

      const errors = {};
      const tieDownInput = new ValidateTieDown();
      tieDownInput.tie_down_name = CreateTieDown.tie_down_name;
      tieDownInput.price = CreateTieDown.price;

      const validation_errors = await validate(tieDownInput);

      const findTieDownExist =
        await this.tieDownService.TieDownNameExist(CreateTieDown);
      if (findTieDownExist) {
        errors['tie_down_name'] = 'This Tie Down name is already exist';
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
      // await this.s3Service.uploadFileToS3ForTieDown(tie_down_image, fileName);
      await this.s3Service.uploadFileToS3ForTieDown({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
      const createdData = await this.tieDownService.createTieDown(
        req.user,
        CreateTieDown,
        fileName,
      );
      if (createdData) {
        return new Success(
          res,
          200,
          createdData,
          '🎉 Tie Down Created Successfully!',
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
  async getAllTieDownList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let category_listing = await this.tieDownService.alltieDownListing(
        req.body,
        req.user,
      );

      if (category_listing) {
        return new Success(res, 200, category_listing, '🎉 All Tie Downs Listed Successfully!');
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

      const TieDownId = req.params.id;
      if (!this.isValidMySQLId(TieDownId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid TieDown id',
          'TieDown id isnot valid',
        );
      }

      const existingTieDown = await this.tieDownModel.findOne({ where: { id , deleted_at : null}});
      if (!existingTieDown) {
        return new CustomErrorResponse(
          res,
          500,
          'TieDown not found',
          'TieDownID doesnot found in database',
        );
      }
      const ListData = await this.tieDownService.TieDownById(req.user, id);
      if (ListData) {
        return new Success(res, 200, ListData, '🔍 Tie Down Found Successfully!');
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
  async categorieDeleteById(@Param("id") id: string, @Req() req: any, @Res() res: Response){
    try {
      const TieDownId = req.params.id;
      if (!this.isValidMySQLId(TieDownId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid TieDown id',
          'TieDown id isnot valid',
        );
      }

      const existingTieDown = await this.tieDownModel.findOne({ where: { id , deleted_at : null}});
      if (!existingTieDown) {
        return new CustomErrorResponse(
          res,
          500,
          'TieDown not found',
          'TieDownID doesnot found in database',
        );
      }
      const data = await this.tieDownService.deleteTieDown(req.user , id)
      if (data) {
        return new Success(res, 200, {}, "🗑️ Tie Down Deleted Successfully!");
      } else {
        return new CustomResponse(res, 400, data, 'Something went wrong during Serach');
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
    }
  }

  @Get('list_V_L')
  async getAllGrommetListValueLabelWise(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let tiedown_listing_VL = await this.tieDownService.allTiedownListingVL(req.user); 
    
      if (tiedown_listing_VL) {
        return new Success(res, 200, tiedown_listing_VL, '📋 All Tie Downs Listed Successfully by Label and Value!');
      } else {
        return new CustomResponse(
          res,
          400,
          tiedown_listing_VL,
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
  @UseInterceptors(FileInterceptor('tie_down_image'))
  async updateTieDownById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() tie_down_image,
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

      const TieDownId = req.params.id;
      if (!this.isValidMySQLId(TieDownId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid TieDown id',
          'TieDown id isnot valid',
        );
      }

      const existingTieDown = await this.tieDownModel.findOne({ where: { id , deleted_at : null}});
      if (!existingTieDown) {
        return new CustomErrorResponse(
          res,
          500,
          'TieDown not found',
          'TieDownID doesnot found in database',
        );
      }

      const resizedImageBuffer = await resizeImage(tie_down_image.buffer, 150, 150);

      // Validate request body
      const errors = {};
      const tiedownInput = new ValidateTieDown();
      tiedownInput.tie_down_name = req.body.tie_down_name;
      tiedownInput.price = req.body.price;

      const validation_errors = await validate(tiedownInput);

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
      if (tie_down_image) {
        await this.s3Service.deleteTieDownImage(existingTieDown.tie_down_image);

        var fileName = `${Date.now()}-${tie_down_image.originalname}`;
        //const imageUrl = await this.s3Service.uploadFileToS3ForTieDown(tie_down_image, fileName);

        await this.s3Service.uploadFileToS3ForTieDown({ buffer: resizedImageBuffer, originalname: fileName }, fileName);

      }
      const updateData = await this.tieDownService.updateTieDown(req.user, id, req.body, fileName);


      if (updateData) {
        return new Success(res, 200, true, "✨ Tie Down Updated Successfully!");
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
      //  const filePath = path.join(__dirname, '../../../../TieDownList.xlsx');
      const bufferData = await this.tieDownService.ExportExcel();

      return new Success(
        res,
        200,
        bufferData,
        '📋 TieDown Excel Successfully Export!',
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
