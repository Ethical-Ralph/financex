import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { CreateCommerceDto } from './dto/create-commerce.dto';
import { UpdateCommerceDto } from './dto/update-commerce.dto';

@Controller('commerce')
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Post()
  create(@Body() createCommerceDto: CreateCommerceDto) {
    return this.commerceService.create(createCommerceDto);
  }

  @Get()
  findAll() {
    return this.commerceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commerceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommerceDto: UpdateCommerceDto) {
    return this.commerceService.update(+id, updateCommerceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commerceService.remove(+id);
  }
}
