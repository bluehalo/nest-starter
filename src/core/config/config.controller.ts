import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ConfigService } from './config.service';

@ApiTags('config')
@Controller('config')
export class ConfigController {
	constructor(private readonly configService: ConfigService) {}

	@Get()
	@ApiResponse({ status: HttpStatus.OK, description: 'Config was returned successfully' })
	public getConfig(): Record<string, any> {
		return this.configService.getWebappConfig();
	}
}
