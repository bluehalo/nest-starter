import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EuaModule } from './eua/eua.module';
import { MessagesModule } from './messages/messages.module';

@Module({
	imports: [
		ConfigModule,
		FeedbackModule,
		AuditModule,
		AuthModule.register(),
		UserModule,
		EuaModule,
		MessagesModule
	]
})
export class CoreModule {}
