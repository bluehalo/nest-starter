import {
	Body,
	Controller,
	Delete,
	Get,
	Headers,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
	UseGuards
} from '@nestjs/common';
import { ApiCreatedResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentType } from '@typegoose/typegoose';

import { AuditService } from '../audit/audit.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { HasAdminRoleGuard } from '../auth/guards/has-role.guard';
import { User } from '../user/user.schema';
import { CurrentUser } from '../auth/current-user.decorator';

import { EuaService } from './eua.service';
import { EuaDto } from './dto/eua-dto';
import { LoadEuaPipe } from './load-eua.pipe';
import { Eua } from './eua.schema';

@ApiTags('EUA')
@Controller('')
export class EuaController {
	constructor(
		private readonly euaService: EuaService,
		private readonly auditService: AuditService
	) {}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('/eua')
	@ApiCreatedResponse({ description: 'EUA was created successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to create an EUA'
	})
	public async create(
		@CurrentUser() currentUser: User,
			@Body() createEuaDto: EuaDto,
			@Headers() headers
	): Promise<Eua> {
		const eua = await this.euaService.create(createEuaDto);

		await this.auditService.audit(
			'eua created',
			'eua',
			'create',
			User.auditCopy(currentUser),
			createEuaDto,
			headers
		);

		return eua;
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Get('/eua/:id')
	@ApiParam({ name: 'id' })
	@ApiCreatedResponse({ status: HttpStatus.OK, description: 'EUA was returned successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to load an EUA'
	})
	public async read(@Param('id', LoadEuaPipe) eua: Eua): Promise<Eua> {
		return eua;
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('/eua/:id')
	@ApiParam({ name: 'id' })
	@ApiCreatedResponse({ description: 'EUA was updated successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to update an EUA'
	})
	public async update(
		@CurrentUser() currentUser: User,
			@Body() updateEuaDto: EuaDto,
			@Param('id', LoadEuaPipe) eua: DocumentType<Eua>,
			@Headers() headers
	): Promise<Eua> {
		// A copy of the original eua for auditing
		const originalEua = Eua.auditCopy(eua);

		eua = await this.euaService.update(eua, updateEuaDto);

		await this.auditService.audit(
			'eua updated',
			'eua',
			'update',
			User.auditCopy(currentUser),
			{
				before: originalEua,
				after: Eua.auditCopy(eua)
			},
			headers
		);
		return eua;
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Delete('/eua/:id')
	@ApiParam({ name: 'id' })
	@ApiCreatedResponse({ description: 'EUA was removed successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to remove an EUA'
	})
	public async remove(
		@CurrentUser() currentUser: User,
			@Param('id', LoadEuaPipe) eua: DocumentType<Eua>,
			@Headers() headers
	): Promise<Eua> {
		await this.auditService.audit(
			'eua deleted',
			'eua',
			'delete',
			User.auditCopy(currentUser),
			Eua.auditCopy(eua),
			headers
		);
		return this.euaService.remove(eua);
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('euas')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'EUAs were retrieved successfully.'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to search EUAs.'
	})
	public search(
	@Query() queryParams: Record<string, any>,
		@Body('q') query: any = {},
		@Body('s') search = null
	) {
		return this.euaService.search(queryParams, query, search);
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('/eua/:id/publish')
	@ApiParam({ name: 'id' })
	@ApiResponse({ status: HttpStatus.OK, description: 'EUA was published successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to publish an EUA'
	})
	public async publish(
		@CurrentUser() currentUser: User,
			@Param('id', LoadEuaPipe) eua: DocumentType<Eua>,
			@Headers() headers
	): Promise<Eua> {
		await this.auditService.audit(
			'eua published',
			'eua',
			'published',
			User.auditCopy(currentUser),
			Eua.auditCopy(eua),
			headers
		);
		return this.euaService.publishEua(eua);
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Get('/eua')
	@ApiCreatedResponse({
		status: HttpStatus.OK,
		description: 'Current EUA was returned successfully'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to load current EUA'
	})
	public async readCurrent(): Promise<Eua> {
		return this.euaService.readCurrent();
	}
}
