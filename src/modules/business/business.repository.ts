import { Injectable } from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Business, DepartmentHead } from './entities';
import { Repository } from 'typeorm';
import { CreateBusinessDepartmentDto } from './dto';

@Injectable()
export class BusinessRepository {
  constructor(
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(DepartmentHead)
    private departmentHeadRepo: Repository<DepartmentHead>,
  ) {}

  findBusinessById(id: string) {
    return this.businessRepo.findOne({ where: { id } });
  }

  validateBusinessDepartment(businessId: string, departmentId: string) {
    return this.businessRepo.findOne({
      where: { id: businessId, departmentHeads: { id: departmentId } },
      relations: {
        departmentHeads: true,
      },
    });
  }

  findDepartmentHeadByEmail(email: string) {
    return this.departmentHeadRepo.findOne({ where: { email } });
  }

  createBusiness(payload: CreateBusinessDto) {
    return this.businessRepo.save(payload);
  }

  async createDepartment(
    business: Business,
    payload: CreateBusinessDepartmentDto,
  ) {
    const departmentHead = this.departmentHeadRepo.create({
      ...payload,
      business,
    });

    return this.departmentHeadRepo.save(departmentHead);
  }
}
