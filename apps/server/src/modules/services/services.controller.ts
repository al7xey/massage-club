import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServiceCatalogQueryDto } from './dto/service-catalog-query.dto';
import { ServicesService } from './services.service';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@Query() query: ServiceCatalogQueryDto) {
    return this.servicesService.findCatalog(query);
  }

  @Get('categories')
  findCategories() {
    return this.servicesService.findCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }
}
