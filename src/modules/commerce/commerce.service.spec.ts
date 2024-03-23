import { Test, TestingModule } from '@nestjs/testing';
import { CommerceService } from './commerce.service';
import { CommerceRepository } from './commerce.repository';
import { BusinessRepository } from '../business/business.repository';
import { TaxService } from './tax.service';

describe('CommerceService', () => {
  let service: CommerceService;
  let commerceRepositoryMock: Partial<CommerceRepository>;
  let businessRepositoryMock: Partial<BusinessRepository>;
  let taxServiceMock: Partial<TaxService>;

  beforeEach(async () => {
    commerceRepositoryMock = {};
    businessRepositoryMock = {};
    taxServiceMock = {};

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
        {
          provide: TaxService,
          useValue: taxServiceMock,
        },
      ],
    }).compile();

    service = module.get<CommerceService>(CommerceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
