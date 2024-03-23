import { Test, TestingModule } from '@nestjs/testing';
import { CommerceService } from './commerce.service';
import { CommerceRepository } from './commerce.repository';
import { BusinessRepository } from '../business/business.repository';

describe('CommerceService', () => {
  let service: CommerceService;
  let commerceRepositoryMock: Partial<CommerceRepository>;
  let businessRepositoryMock: Partial<BusinessRepository>;

  beforeEach(async () => {
    commerceRepositoryMock = {};
    businessRepositoryMock = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommerceService,
        {
          provide: CommerceRepository,
          useValue: commerceRepositoryMock,
        },
        {
          provide: BusinessRepository,
          useValue: businessRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<CommerceService>(CommerceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
