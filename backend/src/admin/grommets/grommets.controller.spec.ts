import { Test, TestingModule } from '@nestjs/testing';
import { GrommetsController } from './grommets.controller';

describe('GrommetsController', () => {
  let controller: GrommetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrommetsController],
    }).compile();

    controller = module.get<GrommetsController>(GrommetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
