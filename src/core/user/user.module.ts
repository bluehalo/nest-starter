import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';

import { AuditModule } from '../audit/audit.module';
import { ConfigModule } from '../config/config.module';

import { UserService } from './user.service';
import { User } from './user.schema';
import { UserController } from './user.controller';

@Module({
	imports: [TypegooseModule.forFeature([User]), AuditModule, ConfigModule],
	exports: [UserService],
	providers: [UserService],
	controllers: [UserController]
})
export class UserModule {}
