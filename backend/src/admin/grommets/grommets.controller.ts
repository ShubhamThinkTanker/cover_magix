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
import { GrommetsService } from './grommets.service';
import { Request, Response } from 'express';
import { CreateGrommets } from './grommets.interface';
//   import from './Validation/grommets.createValidation';
import { validate } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { S3Service } from '../../../Helper/S3Bucket';
import { ValidateGrommets } from './Validation/grommets.createValidation';
import { Grommets } from './grommets.schema';
import { error } from 'console';
import { InjectModel } from '@nestjs/sequelize';
import { CreateGrommetsDto } from './dto/createGrommets.dto';
import { resizeImage } from 'Helper/imageConfigration';

@Controller('grommets')
export class GrommetsController {
  constructor(
    @InjectModel(Grommets) private grommetModel: typeof Grommets,
    private readonly s3Service: S3Service,
    private readonly grommetService: GrommetsService,
  ) { }

  isValidMySQLId(id: string): boolean {
    const regex = /^\d+$/;
    return regex.test(id);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('grommet_image'))
  async grommetscreate(
    @Body() CreateGrommets: CreateGrommetsDto,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() grommet_image,
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

      var fileName = `${Date.now()}-${grommet_image.originalname}`;

      const resizedImageBuffer = await resizeImage(grommet_image.buffer, 150, 150);

      const errors = {};
      const grommetInput = new ValidateGrommets();
      grommetInput.grommet_name = CreateGrommets.grommet_name;
      grommetInput.price = CreateGrommets.price;

      const validation_errors = await validate(grommetInput);

      const findGrommetExist =
        await this.grommetService.GrommetNameExist(CreateGrommets);
      if (findGrommetExist) {
        errors['grommet_name'] = 'This Grommet name is already exist';
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
      // await this.s3Service.uploadFileToS3ForGrommets(grommet_image, fileName);
      await this.s3Service.uploadFileToS3ForGrommets({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
      const createdData = await this.grommetService.createGrommet(
        req.user,
        CreateGrommets,
        fileName,
      );
      if (createdData) {
        return new Success(
          res,
          200,
          createdData,
          '🎉 Grommet Created Successfully!',
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
  async getAllGrommetList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let category_listing = await this.grommetService.allGrommetListing(
        req.body,
        req.user,
      );

      if (category_listing) {
        return new Success(res, 200, category_listing, '🎉 All Grommets Listed Successfully!');
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
  async getByIdGrommetsList(
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

      const GrommetID = req.params.id;
      if (!this.isValidMySQLId(GrommetID)) {
        return res.status(404).json({ message: 'Enter valid Grommet id' });
      }

      const existingGrommet = await this.grommetModel.findOne({ where: { id , deleted_at : null}});
      if (!existingGrommet) {
        return new CustomErrorResponse(
          res,
          500,
          'Grommet not found',
          'GrommetID doesnot found in database',
        );
      }
       
      const ListData = await this.grommetService.GrommetById(req.user, GrommetID);
      if (ListData) {
        return new Success(res, 200, ListData, '🔍 Grommet Found Successfully!');
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
  async grommetDeleteById(@Param("id") id: string, @Req() req: any, @Res() res: Response) {
    try {
      const GrommetId = req.params.id;
      if (!this.isValidMySQLId(GrommetId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Grommet id',
          'Grommet id isnot valid',
        );
      }

      const existingGrommet = await this.grommetModel.findOne({ where: { id , deleted_at : null}});
      if (!existingGrommet) {
        return new CustomErrorResponse(
          res,
          500,
          'Grommet not found',
          'GrommetID doesnot found in database',
        );
      }
     
    
      const data = await this.grommetService.deleteGrommet(req.user, id)
      if (data) {
        return new Success(res, 200, {}, "🗑️ Grommet Deleted Successfully!");
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

      let grommet_listing_VL = await this.grommetService.allGrommetListingVL(req.user);

      if (grommet_listing_VL) {
        return new Success(res, 200, grommet_listing_VL, '📋 All Grommets Listed Successfully by Label and Value!');
      } else {
        return new CustomResponse(
          res,
          400,
          grommet_listing_VL,
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

  @Post('importExcel')
  async importExcel(@Body() data: any[], @Req() req: any, @Res() res: Response) {
    try {
      const result = await this.grommetService.importExcel(data)
      if (result) {
        return new Success(res, 200, result, "Successfully Grommet Excel Imported");
      } else {
        return new CustomResponse(res, 400, result, 'Something went wrong during Imported');
      }
    } catch (error) {
      console.log('Create Block Error -> ', error.message);
      return new CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
    }
  }

  @Post('update/:id')
  @UseInterceptors(FileInterceptor('grommet_image'))
  async updateGrommetById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() grommet_image,
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

      const GrommetId = req.params.id;
      if (!this.isValidMySQLId(GrommetId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Grommet id',
          'Grommet id is not valid',
        );
      }

      // const existingGrommet = await this.grommetService.GrommetById(req.user, GrommetId);
      // if (!existingGrommet) {
      //   throw new Error('Grommet not found');
      // }
      
      const existingGrommet = await this.grommetModel.findOne({ where: { id , deleted_at : null}});
      if (!existingGrommet) {
        return new CustomErrorResponse(
          res,
          500,
          'Grommet not found',
          'GrommetID doesnot found in database',
        );
      }

      const resizedImageBuffer = await resizeImage(grommet_image.buffer, 150, 150);
     
      // Validate request body
      const errors = {};
      const grommetInput = new ValidateGrommets();
      grommetInput.grommet_name = req.body.grommet_name;
      grommetInput.price = req.body.price;

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

      if (grommet_image) {
        await this.s3Service.deleteGrommetImage(existingGrommet.grommet_image);

        var fileName = `${Date.now()}-${grommet_image.originalname}`;
        //const imageUrl = await this.s3Service.uploadFileToS3ForGrommets(grommet_image, fileName);
        await this.s3Service.uploadFileToS3ForGrommets({ buffer: resizedImageBuffer, originalname: fileName }, fileName);

      }
      const updateData = await this.grommetService.updateGrommets(req.user, GrommetId, req.body, fileName);


      if (updateData) {
        return new Success(res, 200, true, "✨ Grommet Updated Successfully!");
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
      //  const filePath = path.join(__dirname, '../../../../GrommetList.xlsx');
      const bufferData = await this.grommetService.ExportExcel();

      return new Success(
        res,
        200,
        bufferData,
        '📋 Grommet Excel Successfully Export!',
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
