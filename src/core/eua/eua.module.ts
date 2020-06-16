import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';

import { AuditModule } from '../audit/audit.module';

import { EuaController } from './eua.controller';
import { EuaService } from './eua.service';
import { Eua } from './eua.schema';

@Module({
	imports: [TypegooseModule.forFeature([Eua]), AuditModule],
	controllers: [EuaController],
	providers: [EuaService]
})
export class EuaModule {}
