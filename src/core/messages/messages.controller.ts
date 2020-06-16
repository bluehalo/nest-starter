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
import { ApiBody, ApiCreatedResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentType } from '@typegoose/typegoose';

import { AuditService } from '../audit/audit.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { HasAdminRoleGuard } from '../auth/guards/has-role.guard';
import { User } from '../user/user.schema';
import { CurrentUser } from '../auth/current-user.decorator';

import { MessagesService } from './messages.service';
import { MessageDto } from './dto/message-dto';
import { LoadMessagePipe } from './load-message.pipe';
import { Message } from './message.schema';
import { DismissedMessage } from './dismissed-message.schema';

@ApiTags('Message')
@Controller('')
export class MessagesController {
	constructor(
		private readonly messagesService: MessagesService,
		private readonly auditService: AuditService
	) {}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('/admin/message')
	@ApiCreatedResponse({ description: 'Message was created successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to create an Message'
	})
	public async create(
		@CurrentUser() currentUser: User,
		@Body() createMessageDto: MessageDto,
		@Headers() headers
	): Promise<Message> {
		const message = await this.messagesService.create(createMessageDto, currentUser);

		await this.auditService.audit(
			'message created',
			'message',
			'create',
			User.auditCopy(currentUser),
			createMessageDto,
			headers
		);

		return message;
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Get('/admin/message/:id')
	@ApiParam({ name: 'id' })
	@ApiCreatedResponse({ status: HttpStatus.OK, description: 'Message was returned successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to load an Message'
	})
	public async read(
		@Param('id', LoadMessagePipe) message: DocumentType<Message>
	): Promise<Message> {
		return message;
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('/admin/message/:id')
	@ApiParam({ name: 'id' })
	@ApiCreatedResponse({ description: 'Message was updated successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to update an Message'
	})
	public async update(
		@CurrentUser() currentUser: User,
		@Body() updateMessageDto: MessageDto,
		@Param('id', LoadMessagePipe) message: DocumentType<Message>,
		@Headers() headers
	): Promise<Message> {
		// A copy of the original message for auditing
		const originalMessage = Message.auditCopy(message);

		message = await this.messagesService.update(message, updateMessageDto);

		await this.auditService.audit(
			'message updated',
			'message',
			'update',
			User.auditCopy(currentUser),
			{
				before: originalMessage,
				after: Message.auditCopy(message)
			},
			headers
		);
		return message;
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Delete('/admin/message/:id')
	@ApiParam({ name: 'id' })
	@ApiCreatedResponse({ description: 'Message was removed successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to remove an Message'
	})
	public async remove(
		@CurrentUser() currentUser: User,
		@Param('id', LoadMessagePipe) message: DocumentType<Message>,
		@Headers() headers
	): Promise<Message> {
		await this.auditService.audit(
			'message deleted',
			'message',
			'delete',
			User.auditCopy(currentUser),
			Message.auditCopy(message),
			headers
		);
		return this.messagesService.remove(message);
	}

	@UseGuards(AuthenticatedGuard)
	@Post('/messages')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Messages were retrieved successfully.'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to search Messages.'
	})
	public search(
		@Query() queryParams: Record<string, any>,
		@Body('q') query: any = {},
		@Body('s') search = null
	) {
		return this.messagesService.search(queryParams, query, search);
	}

	@UseGuards(AuthenticatedGuard)
	@Post('/messages/recent')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Recent Messages were retrieved successfully.'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to retrieve recent Messages.'
	})
	public recent(@CurrentUser() user): Promise<Message[]> {
		return this.messagesService.getRecentMessages(user);
	}

	@UseGuards(AuthenticatedGuard)
	@Post('/message/dismiss')
	@ApiBody({ type: 'string', isArray: true })
	@ApiCreatedResponse({ description: 'Messages were dismissed successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated/Unauthorized user attempted to dismiss messages'
	})
	public async dismiss(
		@CurrentUser() currentUser: User,
		@Body('messageIds') messageIds: string[],
		@Headers() headers
	): Promise<DismissedMessage[]> {
		const dismissedMessages = await this.messagesService.dismissMessages(messageIds, currentUser);

		const auditPromises = dismissedMessages.map(dismissedMessage =>
			this.auditService.audit(
				'message dismissed',
				'message',
				'dismissed',
				User.auditCopy(currentUser),
				DismissedMessage.auditCopy(dismissedMessage),
				headers
			)
		);

		await Promise.all(auditPromises);

		return dismissedMessages;
	}
}
