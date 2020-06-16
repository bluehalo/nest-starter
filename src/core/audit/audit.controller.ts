import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Query,
	UseGuards
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { HasAuditorRoleGuard } from '../auth/guards/has-role.guard';

import { AuditService } from './audit.service';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
	constructor(private readonly auditService: AuditService) {}

	@Post('')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Audit records was retrieved successfully'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated user attempted to retrieve audit records.'
	})
	@UseGuards(AuthenticatedGuard, HasAuditorRoleGuard)
	public search(
		@Query() queryParams: Record<string, any>,
		@Body('q') query: any = {},
		@Body('s') search = null
	): Promise<any> {
		return this.auditService.search(queryParams, query, search);
	}

	@Get('/distinctValues')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Distinct fields values for audit records were retrieved successfully'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description:
			'Unauthenticated user attempted to retrieve distinct field value for audit records.'
	})
	@UseGuards(AuthenticatedGuard, HasAuditorRoleGuard)
	public distinctValues(@Query('field') field: string): Promise<string[]> {
		return this.auditService.getDistinctValues(field);
	}
}
