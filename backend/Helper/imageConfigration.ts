import * as sharp from 'sharp';

export async function resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
  try {
    const metadata = await sharp(buffer).metadata();
    const format = metadata.format;

    const resizedImageBuffer = await sharp(buffer)
      .resize({ width, height })
      .toFormat(format, { quality: 80 })
      .toBuffer();
    return resizedImageBuffer;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
}
