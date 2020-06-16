import { Module } from '@nestjs/common';

import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
	controllers: [ConfigController],
	exports: [ConfigService],
	providers: [ConfigService]
})
export class ConfigModule {}
