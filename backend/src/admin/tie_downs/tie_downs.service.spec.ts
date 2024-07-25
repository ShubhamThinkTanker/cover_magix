import { Test, TestingModule } from '@nestjs/testing';
import { TieDownsService } from './tie_downs.service';

describe('TieDownsService', () => {
  let service: TieDownsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TieDownsService],
    }).compile();

    service = module.get<TieDownsService>(TieDownsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
