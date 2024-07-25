"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizeImage = void 0;
const sharp = require("sharp");
async function resizeImage(buffer, width, height) {
    try {
        const metadata = await sharp(buffer).metadata();
        const format = metadata.format;
        const resizedImageBuffer = await sharp(buffer)
            .resize({ width, height })
            .toFormat(format, { quality: 80 })
            .toBuffer();
        return resizedImageBuffer;
    }
    catch (error) {
        console.error('Error resizing image:', error);
        throw error;
    }
}
exports.resizeImage = resizeImage;
//# sourceMappingURL=imageConfigration.js.map