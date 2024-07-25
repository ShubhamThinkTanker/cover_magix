import { Test, TestingModule } from '@nestjs/testing';
import { AirBagsService } from './air_bags.service';

describe('AirBagsService', () => {
  let service: AirBagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirBagsService],
    }).compile();

    service = module.get<AirBagsService>(AirBagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
