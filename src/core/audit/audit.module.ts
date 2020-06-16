import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';

import { AuditService } from './audit.service';
import { Audit } from './audit.schema';
import { AuditController } from './audit.controller';

@Module({
	imports: [TypegooseModule.forFeature([Audit])],
	exports: [AuditService],
	providers: [AuditService],
	controllers: [AuditController]
})
export class AuditModule {}
