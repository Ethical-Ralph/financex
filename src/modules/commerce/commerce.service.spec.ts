import { Test, TestingModule } from '@nestjs/testing';
import { CommerceService } from './commerce.service';
import { CommerceRepository } from './commerce.repository';
import { BusinessRepository } from '../business/business.repository';
import { TaxService } from './tax.service';
import { HttpException } from '@nestjs/common';
import { CreateOrderDto, CreateInventoryItemDto } from './dto';
import { InventoryItem, Order } from './entities';

describe('CommerceService', () => {
  let service: CommerceService;
  let commerceRepositoryMock: Partial<CommerceRepository>;
  let businessRepositoryMock: Partial<BusinessRepository>;
  let taxServiceMock: Partial<TaxService>;

  beforeEach(async () => {
    commerceRepositoryMock = {
      findInventoryItemById: jest.fn().mockImplementation((itemId: string) => {
        // Mock finding an inventory item by ID
        if (itemId === 'validItemId') {
          return Promise.resolve({
            id: 'validItemId',
            name: 'Test Item',
            description: 'Test description',
            price: 10,
          } as InventoryItem);
        } else {
          return Promise.resolve(null); // Simulate not finding the item
        }
      }),
      createOrder: jest.fn().mockImplementation((orderPayload: Order) => {
        // Mock creating an order
        return Promise.resolve({
          id: 'testOrderId',
          ...orderPayload,
        } as Order);
      }),
      logTransaction: jest.fn().mockResolvedValue(undefined),
      getBusinessOrders: jest.fn().mockResolvedValue([]),
      createInventoryItem: jest
        .fn()
        .mockImplementation((item: InventoryItem) => {
          return Promise.resolve(item);
        }),
    };

    businessRepositoryMock = {
      findBusinessById: jest.fn().mockImplementation((businessId: string) => {
        // Mock finding a business by ID
        if (businessId === 'validBusinessId') {
          return Promise.resolve({
            id: 'validBusinessId',
            name: 'Test Business',
          });
        } else {
          return Promise.resolve(null); // Simulate not finding the business
        }
      }),
      validateBusinessDepartment: jest.fn().mockResolvedValue(true),
    };

    taxServiceMock = {
      logTax: jest.fn().mockResolvedValue(undefined),
    };

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

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        orderItems: [{ itemId: 'validItemId', quantity: 2 }],
      };
      const result = await service.create(
        'validBusinessId',
        'validDepartmentId',
        createOrderDto,
      );
      expect(result.id).toBe('testOrderId');
      expect(commerceRepositoryMock.createOrder).toBeCalledWith(
        expect.objectContaining({
          businessId: 'validBusinessId',
          departmentHeadId: 'validDepartmentId',
          totalPrice: 20, // 2 items at 10 each
        }),
      );
    });

    it('should throw an error if business does not exist', async () => {
      await expect(
        service.create(
          'invalidBusinessId',
          'validDepartmentId',
          {} as CreateOrderDto,
        ),
      ).rejects.toThrowError(HttpException);
      expect(businessRepositoryMock.findBusinessById).toBeCalledWith(
        'invalidBusinessId',
      );
    });

    it('should log the transaction and tax after creating an order', async () => {
      const createOrderDto: CreateOrderDto = {
        orderItems: [{ itemId: 'validItemId', quantity: 2 }],
      };
      await service.create(
        'validBusinessId',
        'validDepartmentId',
        createOrderDto,
      );
      expect(commerceRepositoryMock.logTransaction).toBeCalled();
      expect(taxServiceMock.logTax).toBeCalled();
    });

    it('should throw an error if an item does not exist', async () => {
      commerceRepositoryMock.findInventoryItemById = jest
        .fn()
        .mockResolvedValue(null);
      const createOrderDto: CreateOrderDto = {
        orderItems: [{ itemId: 'invalidItemId', quantity: 2 }],
      };
      await expect(
        service.create('validBusinessId', 'validDepartmentId', createOrderDto),
      ).rejects.toThrowError(HttpException);
      expect(commerceRepositoryMock.findInventoryItemById).toBeCalledWith(
        'invalidItemId',
      );
    });
  });

  describe('createInventoryItem', () => {
    it('should create a new inventory item', async () => {
      const createInventoryItemDto: CreateInventoryItemDto = {
        name: 'New Item',
        description: 'Item description',
        price: 20,
      };
      const result = await service.createInventoryItem(
        'validBusinessId',
        createInventoryItemDto,
      );
      expect(result.name).toBe('New Item');
      expect(result.price).toBe(20);
      expect(commerceRepositoryMock.createInventoryItem).toHaveBeenCalled();
    });
  });

  describe('getBusinessOrders', () => {
    it('should return orders for a valid business', async () => {
      const result = await service.getBusinessOrders('validBusinessId');

      expect(result).toEqual([]);
    });
  });
});
