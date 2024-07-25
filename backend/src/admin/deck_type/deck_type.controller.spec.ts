import { Test, TestingModule } from '@nestjs/testing';
import { DeckTypeController } from './deck_type.controller';

describe('DeckTypeController', () => {
  let controller: DeckTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeckTypeController],
    }).compile();

    controller = module.get<DeckTypeController>(DeckTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
