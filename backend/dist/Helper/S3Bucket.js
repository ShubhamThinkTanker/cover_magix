"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const AWS = require("aws-sdk");
let S3Service = exports.S3Service = class S3Service {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });
    }
    async uploadFileToS3ForGrommets(file, filename) {
        return this.uploadFileToS3('upload/Grommets', file, filename);
    }
    async uploadFileToS3CategoryAndSubCategory(file, filename) {
        return this.uploadFileToS3('upload/Categories-SubCategories', file, filename);
    }
    async uploadFileToS3ForTieDown(file, filename) {
        return this.uploadFileToS3('upload/Tie_Down', file, filename);
    }
    async uploadFileToS3ForFabric(file, filename) {
        return this.uploadFileToS3('upload/Fabric', file, filename);
    }
    async uploadFileToS3ForDeck(file, filename) {
        return this.uploadFileToS3('upload/DeckType', file, filename);
    }
    async uploadFileToS3ForZipper(file, filename) {
        return this.uploadFileToS3('upload/Zipper', file, filename);
    }
    async uploadFileToS3ForProduct(file, filename) {
        const uploadPromises = [];
        for (let i = 0; i < file.length; i++) {
            const files = file[i];
            const filenames = filename[i];
            uploadPromises.push(this.uploadFileToS3('upload/Product', files, filenames));
        }
        try {
            const urls = await Promise.all(uploadPromises);
            return urls;
        }
        catch (error) {
            console.error('Error uploading files to S3:', error);
            throw new Error('Failed to upload files to S3');
        }
    }
    async uploadFileToS3ForRatting(file, filename) {
        const uploadPromises = [];
        for (let i = 0; i < file.length; i++) {
            const files = file[i];
            const filenames = filename[i];
            uploadPromises.push(this.uploadFileToS3('upload/Rattings', files, filenames));
        }
        try {
            const urls = await Promise.all(uploadPromises);
            return urls;
        }
        catch (error) {
            console.error('Error uploading files to S3:', error);
            throw new Error('Failed to upload files to S3');
        }
    }
    async uploadFileToS3ForBanners(file, filename) {
        const uploadPromises = [];
        for (let i = 0; i < file.length; i++) {
            const files = file[i];
            const filenames = filename[i];
            uploadPromises.push(this.uploadFileToS3('upload/Banners', files, filenames));
        }
        try {
            const urls = await Promise.all(uploadPromises);
            return urls;
        }
        catch (error) {
            console.error('Error uploading files to S3:', error);
            throw new Error('Failed to upload files to S3');
        }
    }
    async uploadFileToS3(folder, file, filename) {
        const params = {
            Bucket: 'covermagix',
            Key: `${folder}/${filename}`,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype,
        };
        const { Location } = await this.s3.upload(params).promise();
        return Location;
    }
    async uploadFileToS3FromURL(url, filename) {
        try {
            const params = {
                Bucket: 'covermagix',
                Key: `upload/Grommets/${filename}`,
                Body: url,
                ACL: 'public-read',
                ContentType: 'image/jpeg',
            };
            const { Location } = await this.s3.upload(params).promise();
            return Location;
        }
        catch (error) {
            console.error('Error uploading image from URL to S3:', error);
            throw new Error('Failed to upload image from URL to S3');
        }
    }
    async deleteFabricImage(filename) {
        const params = {
            Bucket: 'covermagix',
            Key: `upload/Fabric/${filename}`,
        };
        await this.s3.deleteObject(params).promise();
    }
    async deleteProductImage(images) {
        try {
            const deletePromises = images.map(async (image) => {
                const params = {
                    Bucket: 'covermagix',
                    Key: `upload/Product/${image.fileName}`,
                };
                await this.s3.deleteObject(params).promise();
            });
            await Promise.all(deletePromises);
        }
        catch (error) {
            console.error(`Error deleting objects: ${error}`);
            throw error;
        }
    }
    async deleteProduct(filenames) {
        try {
            const deletePromises = filenames.map(async (filename) => {
                const params = {
                    Bucket: 'covermagix',
                    Key: `upload/Product/${filename}`,
                };
                await this.s3.deleteObject(params).promise();
            });
            await Promise.all(deletePromises);
        }
        catch (error) {
            console.error(`Error deleting objects: ${error}`);
            throw error;
        }
    }
    async deleteGrommetImage(filename) {
        try {
            const params = {
                Bucket: 'covermagix',
                Key: `upload/Grommets/${filename}`,
            };
            await this.s3.deleteObject(params).promise();
        }
        catch (err) {
            throw err;
        }
    }
    async deleteZipperImage(filename) {
        try {
            const params = {
                Bucket: 'covermagix',
                Key: `upload/Zipper/${filename}`,
            };
            await this.s3.deleteObject(params).promise();
        }
        catch (err) {
            throw err;
        }
    }
    async deleteDeckTypeImage(filename) {
        try {
            const params = {
                Bucket: 'covermagix',
                Key: `upload/DeckType/${filename}`,
            };
            await this.s3.deleteObject(params).promise();
        }
        catch (err) {
            throw err;
        }
    }
    async deleteTieDownImage(filename) {
        try {
            const params = {
                Bucket: 'covermagix',
                Key: `upload/Tie_Down/${filename}`,
            };
            await this.s3.deleteObject(params).promise();
        }
        catch (err) {
            throw err;
        }
    }
    async deleteFabricMaterialImage(filename) {
        try {
            const params = {
                Bucket: 'covermagix',
                Key: `upload/Fabric/${filename}`,
            };
            await this.s3.deleteObject(params).promise();
        }
        catch (err) {
            throw err;
        }
    }
};
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
//# sourceMappingURL=S3Bucket.js.map