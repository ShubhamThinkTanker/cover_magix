export declare class S3Service {
    private s3;
    constructor();
    uploadFileToS3ForGrommets(file: any, filename: any): Promise<string>;
    uploadFileToS3CategoryAndSubCategory(file: any, filename: any): Promise<string>;
    uploadFileToS3ForTieDown(file: any, filename: any): Promise<string>;
    uploadFileToS3ForFabric(file: any, filename: any): Promise<string>;
    uploadFileToS3ForDeck(file: any, filename: any): Promise<string>;
    uploadFileToS3ForZipper(file: any, filename: any): Promise<string>;
    uploadFileToS3ForProduct(file: any, filename: any): Promise<string[]>;
    uploadFileToS3ForRatting(file: any, filename: any): Promise<string[]>;
    uploadFileToS3ForBanners(file: any, filename: any): Promise<string[]>;
    private uploadFileToS3;
    uploadFileToS3FromURL(url: string, filename: string): Promise<string>;
    deleteFabricImage(filename: string): Promise<void>;
    deleteProductImage(images: {
        id: string;
        fileName: string;
    }[]): Promise<void>;
    deleteProduct(filenames: string[]): Promise<void>;
    deleteGrommetImage(filename: string): Promise<void>;
    deleteZipperImage(filename: string): Promise<void>;
    deleteDeckTypeImage(filename: string): Promise<void>;
    deleteTieDownImage(filename: string): Promise<void>;
    deleteFabricMaterialImage(filename: string): Promise<void>;
}
