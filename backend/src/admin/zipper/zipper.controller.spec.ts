import { Test, TestingModule } from '@nestjs/testing';
import { ZipperController } from './zipper.controller';

describe('ZipperController', () => {
  let controller: ZipperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZipperController],
    }).compile();

    controller = module.get<ZipperController>(ZipperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
