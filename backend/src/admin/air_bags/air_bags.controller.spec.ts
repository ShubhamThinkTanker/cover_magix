import { Test, TestingModule } from '@nestjs/testing';
import { AirBagsController } from './air_bags.controller';

describe('AirBagsController', () => {
  let controller: AirBagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirBagsController],
    }).compile();

    controller = module.get<AirBagsController>(AirBagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
