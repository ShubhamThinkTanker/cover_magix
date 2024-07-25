import { Test, TestingModule } from '@nestjs/testing';
import { DeckTypeService } from './deck_type.service';

describe('DeckTypeService', () => {
  let service: DeckTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeckTypeService],
    }).compile();

    service = module.get<DeckTypeService>(DeckTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
