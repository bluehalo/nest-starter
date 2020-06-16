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

import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { HasAdminRoleGuard } from '../auth/guards/has-role.guard';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { ConfigService } from '../config/config.service';

import { UserService } from './user.service';
import { LoadUserPipe } from './load-user.pipe';
import { UserDto } from './dto/user-dto';
import { User } from './user.schema';

@ApiTags('User')
@Controller('')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly auditService: AuditService,
		private readonly configService: ConfigService
	) {}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('/admin/user')
	@ApiCreatedResponse({ description: 'User was created successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to create a User'
	})
	public async create(
		@CurrentUser() currentUser: User,
		@Body() createUserDto: UserDto,
		@Headers() headers
	): Promise<User> {
		const user = await this.userService.create(createUserDto);

		await this.auditService.audit(
			'admin user created',
			'user',
			'admin create',
			User.auditCopy(currentUser),
			createUserDto,
			headers
		);

		return User.fullCopy(user);
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Get('/admin/user/:userId')
	@ApiParam({ name: 'userId' })
	@ApiCreatedResponse({ status: HttpStatus.OK, description: 'User was returned successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to load a User'
	})
	public async read(@Param('userId', LoadUserPipe) user: DocumentType<User>): Promise<User> {
		return User.fullCopy(user);
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('/admin/user/:userId')
	@ApiParam({ name: 'userId' })
	@ApiCreatedResponse({ description: 'User was updated successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to update a User'
	})
	public async update(
		@CurrentUser() currentUser: User,
		@Body() updateDto: UserDto,
		@Param('userId', LoadUserPipe) user: DocumentType<User>,
		@Headers() headers
	): Promise<User> {
		// A copy of the original user for auditing
		const originalUser = User.auditCopy(user);

		const updatedUser = this.userService.update(user, updateDto);

		await this.auditService.audit(
			'admin user updated',
			'user',
			'admin update',
			User.auditCopy(currentUser),
			{
				before: originalUser,
				after: User.auditCopy(updatedUser)
			},
			headers
		);

		// Send approved user email
		if ((this.configService.getConfig() as any).coreEmails?.approvedUserEmail?.enabled ?? false) {
			const originalUserRole = originalUser?.roles?.user ?? null;
			const newUserRole = user?.roles?.user ?? null;

			if (originalUserRole !== newUserRole && newUserRole) {
				// await userEmailService.emailApprovedUser(user);
			}
		}

		return User.fullCopy(updatedUser);
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
		@Param('id', LoadUserPipe) user: DocumentType<User>,
		@Headers() headers
	): Promise<User> {
		// TODO: implement this, possibly set up with events to allow sites to subscribe to remove events and react.
		// return resourcesService.deleteResourcesWithOwner(user._id, 'user');

		const removedUser = await this.userService.remove(user);

		await this.auditService.audit(
			'admin user deleted',
			'user',
			'admin delete',
			User.auditCopy(currentUser),
			User.auditCopy(user),
			headers
		);

		return User.fullCopy(removedUser);
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('admin/users')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Users were retrieved successfully.'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to retrieve Users.'
	})
	public adminSearch(
		@Query() queryParams: Record<string, any>,
		@Body('q') query: any = {},
		@Body('s') search = null
	) {
		return this.userService.adminSearch(queryParams, query, search);
	}
}
