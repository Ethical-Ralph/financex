import { Test, TestingModule } from '@nestjs/testing';
import { CommerceController } from './commerce.controller';
import { CommerceService } from './commerce.service';
import { CommerceRepository } from './commerce.repository';

describe('CommerceController', () => {
  let controller: CommerceController;
  let commerceServiceMock: Partial<CommerceService>;
  let commerceRepositoryMock: Partial<CommerceRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommerceController],
      providers: [
        {
          provide: CommerceService,
          useValue: commerceServiceMock,
        },
        {
          provide: CommerceRepository,
          useValue: commerceRepositoryMock,
        },
      ],
    }).compile();

    controller = module.get<CommerceController>(CommerceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
