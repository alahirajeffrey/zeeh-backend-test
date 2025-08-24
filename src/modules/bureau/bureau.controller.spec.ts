import { Test, TestingModule } from '@nestjs/testing';
import { BureauController } from './bureau.controller';

describe('BureauController', () => {
  let controller: BureauController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BureauController],
    }).compile();

    controller = module.get<BureauController>(BureauController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
