import { Controller, Get } from '@nestjs/common';

import { SiteService } from './site.service';

@Controller()
export class SiteController {
	constructor(private readonly appService: SiteService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
}
