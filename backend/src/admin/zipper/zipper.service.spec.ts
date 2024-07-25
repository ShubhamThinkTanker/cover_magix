import { Test, TestingModule } from '@nestjs/testing';
import { ZipperService } from './zipper.service';

describe('ZipperService', () => {
  let service: ZipperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZipperService],
    }).compile();

    service = module.get<ZipperService>(ZipperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
