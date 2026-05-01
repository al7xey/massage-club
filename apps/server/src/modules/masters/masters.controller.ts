import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MastersService } from './masters.service';

@ApiTags('Masters')
@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get()
  findAll() {
    return this.mastersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mastersService.findOne(id);
  }
}
