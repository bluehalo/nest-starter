import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../user/user.module';
import { ConfigModule } from '../config/config.module';
import { AuditModule } from '../audit/audit.module';
import { ConfigService } from '../config/config.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionSerializer } from './session.serializer';
import { LocalPlugin } from './strategies/plugins/local.plugin';
import { ProxyPkiPlugin } from './strategies/plugins/proxy-pki.plugin';
import { DynamicStrategy, DynamicAuthPlugin } from './strategies/dynamic.strategy';
import {ModuleRef} from "@nestjs/core";

@Module({})
export class AuthModule {
	static register(): DynamicModule {
		const connectionFactory = {
			provide: DynamicAuthPlugin,
			imports: [ConfigModule],
			useFactory: (configService: ConfigService, moduleRef: ModuleRef) => {
				if (configService.getConfig().auth.strategy === 'proxy-pki') {
					return moduleRef.create(ProxyPkiPlugin);
					// return new ProxyPkiPlugin();
				}
				return moduleRef.create(LocalPlugin);
				// return new LocalPlugin();
			},
			inject: [ConfigService, ModuleRef]
		};

		return {
			module: AuthModule,
			controllers: [AuthController],
			imports: [AuditModule, ConfigModule, UserModule, PassportModule],
			providers: [AuthService, SessionSerializer, DynamicStrategy, connectionFactory]
		};
	}
}
