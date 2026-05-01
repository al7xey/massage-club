import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../services/entities/service.entity';
import { Studio } from '../studios/entities/studio.entity';
import { MasterShift } from './entities/master-shift.entity';
import { Master } from './entities/master.entity';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';

@Module({
  imports: [TypeOrmModule.forFeature([Master, MasterShift, Studio, Service])],
  controllers: [MastersController],
  providers: [MastersService],
  exports: [MastersService, TypeOrmModule],
})
export class MastersModule {}
