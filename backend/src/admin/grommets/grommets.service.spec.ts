import { Test, TestingModule } from '@nestjs/testing';
import { GrommetsService } from './grommets.service';

describe('GrommetsService', () => {
  let service: GrommetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrommetsService],
    }).compile();

    service = module.get<GrommetsService>(GrommetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
