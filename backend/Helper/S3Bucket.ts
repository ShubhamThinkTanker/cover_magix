import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Request } from 'express';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadFileToS3ForGrommets(file, filename): Promise<string> {
    return this.uploadFileToS3('upload/Grommets', file, filename);
  }

  async uploadFileToS3CategoryAndSubCategory(file, filename): Promise<string> {
    return this.uploadFileToS3('upload/Categories-SubCategories', file, filename);
  }

  async uploadFileToS3ForTieDown(file, filename): Promise<string> {
    return this.uploadFileToS3('upload/Tie_Down', file, filename);
  }

  async uploadFileToS3ForFabric(file, filename): Promise<string> {
    return this.uploadFileToS3('upload/Fabric', file, filename);
  }

  async uploadFileToS3ForDeck(file, filename): Promise<string> {
    return this.uploadFileToS3('upload/DeckType', file, filename);
  }

  async uploadFileToS3ForZipper(file, filename): Promise<string> {
    return this.uploadFileToS3('upload/Zipper', file, filename);
  }

  async uploadFileToS3ForProduct(file, filename): Promise<string[]> {
    // return this.uploadFileToS3('upload/Product', file, filename);
    const uploadPromises = [];
    for (let i = 0; i < file.length; i++) {
      const files = file[i];
      const filenames = filename[i];
      uploadPromises.push(this.uploadFileToS3('upload/Product', files, filenames));
    }
    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading files to S3:', error);
      throw new Error('Failed to upload files to S3');
    }
  }

  async uploadFileToS3ForRatting(file, filename): Promise<string[]> {
    // return this.uploadFileToS3('upload/Product', file, filename);
    const uploadPromises = [];
    for (let i = 0; i < file.length; i++) {
      const files = file[i];
      const filenames = filename[i];
      uploadPromises.push(this.uploadFileToS3('upload/Rattings', files, filenames));
    }
    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading files to S3:', error);
      throw new Error('Failed to upload files to S3');
    }
  }

  async uploadFileToS3ForBanners(file, filename): Promise<string[]> {
    // return this.uploadFileToS3('upload/Product', file, filename);
    const uploadPromises = [];
    for (let i = 0; i < file.length; i++) {
      const files = file[i];
      const filenames = filename[i];
      uploadPromises.push(this.uploadFileToS3('upload/Banners', files, filenames));
    }
    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading files to S3:', error);
      throw new Error('Failed to upload files to S3');
    }
  }

  private async uploadFileToS3(folder: string, file, filename): Promise<string> {
    
    const params: AWS.S3.PutObjectRequest = {
      Bucket: 'covermagix',
      Key: `${folder}/${filename}`,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };

    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }

  async uploadFileToS3FromURL(url: string , filename: string): Promise<string> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: 'covermagix',
        Key: `upload/Grommets/${filename}`,
        Body: url,
        ACL: 'public-read',
        ContentType: 'image/jpeg', // Adjust content type based on your image format
      };

      const { Location } = await this.s3.upload(params).promise();
      return Location;
    } catch (error) {
      console.error('Error uploading image from URL to S3:', error);
      throw new Error('Failed to upload image from URL to S3');
    }
  }

  async deleteFabricImage(filename: string): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: 'covermagix',
      Key: `upload/Fabric/${filename}`,
    };

    await this.s3.deleteObject(params).promise();
  }

  async deleteProductImage(images: { id: string; fileName: string }[]): Promise<void> {
    try {
      const deletePromises = images.map(async (image) => {
        const params: AWS.S3.DeleteObjectRequest = {
          Bucket: 'covermagix',
          Key: `upload/Product/${image.fileName}`,
        };
  
        await this.s3.deleteObject(params).promise();
      });
  
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(`Error deleting objects: ${error}`);
      throw error;
    }
  }
  
  async deleteProduct(filenames: string[]): Promise<void> {
    try {
      const deletePromises = filenames.map(async (filename) => {
        const params: AWS.S3.DeleteObjectRequest = {
          Bucket: 'covermagix',
          Key: `upload/Product/${filename}`,
        };

  
        await this.s3.deleteObject(params).promise();
      });
  
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(`Error deleting objects: ${error}`);
      throw error;
    }
  }

  async deleteGrommetImage(filename: string): Promise<void> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: 'covermagix',
        Key: `upload/Grommets/${filename}`,
      };
      await this.s3.deleteObject(params).promise();
    } catch (err) {
      throw err;
    }
  }

  
  async deleteZipperImage(filename: string): Promise<void> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: 'covermagix',
        Key: `upload/Zipper/${filename}`,
      };
      await this.s3.deleteObject(params).promise();
    } catch (err) {
      throw err;
    }
  }

  async deleteDeckTypeImage(filename: string): Promise<void> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: 'covermagix',
        Key: `upload/DeckType/${filename}`,
      };
      await this.s3.deleteObject(params).promise();
    } catch (err) {
      throw err;
    }
  }

  async deleteTieDownImage(filename: string): Promise<void> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: 'covermagix',
        Key: `upload/Tie_Down/${filename}`,
      };
      await this.s3.deleteObject(params).promise();
    } catch (err) {
      throw err;
    }
  }

  async deleteFabricMaterialImage(filename: string): Promise<void> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: 'covermagix',
        Key: `upload/Fabric/${filename}`,
      };
      await this.s3.deleteObject(params).promise();
    } catch (err) {
      throw err;
    }
  }
}
