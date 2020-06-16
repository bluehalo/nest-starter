import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({})
export class AuthModule {
	static register(): DynamicModule {
		return {
			module: AuthModule,
			controllers: [AuthController],
			imports: [UserModule, PassportModule],
			providers: [AuthService, SessionSerializer, LocalStrategy]
		};
	}
}
