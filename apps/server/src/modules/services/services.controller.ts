import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { ServiceCatalogQueryDto } from './dto/service-catalog-query.dto';
import { ServicesService } from './services.service';

@ApiTags('Services')
@Controller('services')
@UseGuards(OptionalJwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@Query() query: ServiceCatalogQueryDto, @CurrentUser() user?: JwtUserPayload) {
    return this.servicesService.findCatalog(query, user?.sub);
  }

  @Get('categories')
  findCategories(@CurrentUser() user?: JwtUserPayload) {
    return this.servicesService.findCategories(user?.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: JwtUserPayload) {
    return this.servicesService.findOne(id, user?.sub);
  }
}
