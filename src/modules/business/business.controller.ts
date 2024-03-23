import { Controller, Post, Body, Param } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { CreateBusinessDepartmentDto } from './dto';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  create(@Body() payload: CreateBusinessDto) {
    return this.businessService.create(payload);
  }

  @Post(':businessId/department')
  createDepartment(
    @Param('businessId') id: string,
    @Body() payload: CreateBusinessDepartmentDto,
  ) {
    return this.businessService.createDepartment(id, payload);
  }
}
