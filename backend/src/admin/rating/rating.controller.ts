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
import { InjectModel } from '@nestjs/sequelize';
import { RatingService } from './rating.service';
import { S3Service } from 'Helper/S3Bucket';
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  Success,
} from 'Helper/commonResponse';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { CreateRatingDto } from './dto/createRating.dto';
import { resizeImage } from 'Helper/imageConfigration';
import { v4 as uuidv4 } from 'uuid';

@Controller('rating')
export class RatingController {
  constructor(
    private readonly rattingService: RatingService,
    private readonly s3Service: S3Service,
  ) //  // @InjectModel(Grommets)

  { }

  @Post('create')
  @UseInterceptors(FilesInterceptor('images'))
  async rattingCreate(
    @Body() CreateRating: CreateRatingDto,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFiles() images,
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

      let filesWithId = [];

      if (images.length > 0) {
        const resizedImages = await Promise.all(images.map(async (file) => {
          const resizedImageBuffer = await resizeImage(file.buffer, 150, 150);
          return { buffer: resizedImageBuffer, originalname: file.originalname, mimetype: file.mimetype };
        }));

        filesWithId = images.map((file) => ({
          id: uuidv4(), // Generate UUID
          fileName: `${Date.now()}-${file.originalname}`,
        }));

        await this.s3Service.uploadFileToS3ForRatting(resizedImages, filesWithId.map(file => file.fileName));
      }

      const createdData = await this.rattingService.createRating(
        req.user,
        CreateRating,
        filesWithId
      );

      if (createdData) {
        return new Success(
          res,
          200,
          createdData,
          '🌟 Your rating has been successfully added! Thank you for your feedback! 🌟',
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
  async getAllRatingDownList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let ratings = await this.rattingService.alltieRattingisting(
        req.user,
        req.body,
      );

      if (ratings) {
        return new Success(res, 200, ratings, '🎉 All Ratings Listed Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          ratings,
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


      const ListData = await this.rattingService.RattingById(req.user, id);
      if (ListData) {
        return new Success(res, 200, ListData, '🔍 Rating Found Successfully!');
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

  // @Post('update/:id')
  // @UseInterceptors(FileInterceptor('images'))
  // async updateRatingsById(
  //   @Param('id') id: string,
  //   @Req() req: any,
  //   @Res() res: Response,
  //   @UploadedFile() images: Express.Multer.File,
  // ) {
  //   try {
  //     // Check if the user is logged in
  //     if (!req.user) {
  //       return new CustomErrorResponse(
  //         res,
  //         401,
  //         'Invalid User login',
  //         'Invalid Login credential',
  //       );
  //     }

  //     const RatingId = req.params.id;

  //     // Check if the category exists
  //     const existingRatings = await this.rattingService.RattingById(req.user, RatingId);
  //     if (!existingRatings) {
  //       return new CustomErrorResponse(
  //         res,
  //         500,
  //         'Ratings not found',
  //         'Rating ID does not found in database',
  //       );
  //     }

  //     // Handle the uploaded file if exists
  //     const fileName = existingRatings.images;
  //     if (images) {
  //       const fileName = `${Date.now()}-${images.originalname}`;
  //       console.log(fileName , "filesss")
  //       const f = await this.s3Service.uploadFileToS3ForRatting(images, fileName);
  //       console.log(f , "s3 upload files")
  //     }

  //     // Update the category with the provided data
  //     const updateData = await this.rattingService.updateRating(
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
  //         '🎊 Ratings Updated Successfully!',
  //       );
  //     } else {
  //       return new CustomResponse(
  //         res,
  //         400,
  //         false,
  //         'Something went wrong during update',
  //       );
  //     }
  //   } catch (error) {
  //     console.log('Update Category Error -> ', error);
  //     return new CustomCatchBlockErrorMessage(
  //       res,
  //       500,
  //       error.toString(),
  //       'Something went wrong',
  //     );
  //   }
  // }

  @Post('update/:id')
  @UseInterceptors(FilesInterceptor('images'))
  async updateRating(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFiles() images,
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

      const existingRating = await this.rattingService.RattingById(req.user, id);
      if (!existingRating) {
        return new CustomErrorResponse(
          res,
          404,
          'Rating Not Found',
          'The rating you are trying to update does not exist',
        );
      }

      let filesWithId = [];

      if (images.length > 0) {
        const resizedImages = await Promise.all(images.map(async (file) => {
          const resizedImageBuffer = await resizeImage(file.buffer, 150, 150);
          return { buffer: resizedImageBuffer, originalname: file.originalname, mimetype: file.mimetype };
        }));

        filesWithId = images.map((file) => ({
          id: uuidv4(),
          fileName: `${Date.now()}-${file.originalname}`,
        }));

        await this.s3Service.uploadFileToS3ForRatting(resizedImages, filesWithId.map(file => file.fileName));
      }

      const updatedData = await this.rattingService.updateRating(
        req.user,
        req.params.id,
        req.body,
        filesWithId
      );

      if (updatedData) {
        return new Success(
          res,
          200,
          updatedData,
          '🌟 Your rating has been successfully updated! Thank you for your feedback! 🌟',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          updatedData,
          'Something went wrong during the update',
        );
      }
    } catch (error) {
      console.log('Update Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('delete/:id')
  async RatingsDeleteById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {

      const ratingID = req.params.id;
      const existingRatings = await this.rattingService.deleteRatings(req.user, ratingID);
      if (!existingRatings) {
        return new CustomErrorResponse(
          res,
          500,
          'Rating ID not found',
          'Rating ID does not found in database',
        );
      }

      const data = await this.rattingService.deleteRatings(req.user, id);
      if (data) {
        return new Success(
          res,
          200,
          {},
          '🗑️ Ratings Deleted Successfully!',
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
  async getRatingsListValueLabelWiseByID(
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

      const ratingsListingVL = await this.rattingService.RatingsListingVLByID(req.user, id);

      if (ratingsListingVL.length > 0) {
        return new Success(
          res,
          200,
          ratingsListingVL,
          '📋 Ratings Listed Successfully by Label and Value!',
        );
      } else {
        return new CustomResponse(
          res,
          404,
          ratingsListingVL,
          'No ratings found for the provided ID',
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

  @Get('list_V_L_ByID')
  async getRatingsListValueLabel(
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

      const ratingsListingVL = await this.rattingService.RatingsListingVL(req.user);

      if (ratingsListingVL.length > 0) {
        return new Success(
          res,
          200,
          ratingsListingVL,
          '📋 Ratings Listed Successfully by Label and Value!',
        );
      } else {
        return new CustomResponse(
          res,
          404,
          ratingsListingVL,
          'No ratings found for the provided ID',
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

  @Get('product/approved')
  findApprovedRatings() {
    return this.rattingService.findApprovedRatingsByProduct();
  }

  @Get('product/rejected')
  findRejectedRatings() {
    return this.rattingService.findRejectedRatingsByProduct();
  }

  // @Post('status')
  // async manageRatingStatus(@Req() req: any, @Res() res: Response) {
  //   if (!req.user) {
  //     return new CustomErrorResponse(
  //       res,
  //       401,
  //       'Invalid User login',
  //       'Invalid Login credential',
  //     );
  //   }

  //   return this.rattingService.ratingStatusManage(req.user,req.body)
  // }

  @Post('status')
async manageRatingStatus(@Req() req: any, @Res() res: Response) {
  try {
    if (!req.user) {
      return new CustomErrorResponse(
        res,
        401,
        'Invalid User login',
        'Invalid Login credential',
      );
    }

    const ratingStatusResult = await this.rattingService.ratingStatusManage(req.user, req.body);

    if (ratingStatusResult) {
      return new Success(
        res,
        200,
        ratingStatusResult,
        'Rating status managed successfully',
      );
    } else {
      return new CustomResponse(
        res,
        404,
        ratingStatusResult,
        'Failed to manage rating status',
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


  @Get('excel')
  async exportExcel(@Res() res: Response, @Req() req: Request) {
    try {
      // const filePath = path.join(__dirname, '../../../../CategoryList.xlsx');
      const bufferData = await this.rattingService.ExportExcel();

      return new Success(
        res,
        200,
        bufferData,
        '📋 Rating Excel Successfully Export!',
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
