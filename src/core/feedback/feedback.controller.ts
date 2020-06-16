import {
	Controller,
	Post,
	Body,
	HttpCode,
	Headers,
	Query,
	UseGuards,
	HttpStatus
} from '@nestjs/common';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuditService } from '../audit/audit.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { HasAdminRoleGuard } from '../auth/guards/has-role.guard';
import { User } from '../user/user.schema';
import { CurrentUser } from '../auth/current-user.decorator';
import { UtilService } from '../../common/util.service';

import { CreateFeedbackDto } from './dto/create-feedback-dto';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.schema';

@ApiTags('Feedback')
@Controller('')
export class FeedbackController {
	constructor(
		private readonly feedbackService: FeedbackService,
		private readonly auditService: AuditService
	) {}

	@UseGuards(AuthenticatedGuard)
	@Post('/feedback')
	@ApiCreatedResponse({ description: 'Feedback was submitted successfully' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated user attempted to submit feedback'
	})
	public async create(
		@CurrentUser() currentUser: User,
			@Body() createFeedbackDto: CreateFeedbackDto,
			@Headers() headers
	): Promise<Feedback> {
		const userAgentObj = UtilService.getUserAgentFromHeader(headers);
		const feedback = await this.feedbackService.create(createFeedbackDto, userAgentObj);

		await this.auditService.audit(
			'Feedback submitted',
			'feedback',
			'create',
			User.auditCopy(currentUser),
			feedback.toObject(),
			headers
		);

		return feedback;
	}

	@UseGuards(AuthenticatedGuard, HasAdminRoleGuard)
	@Post('admin/feedback')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Feedback were retrieved successfully.'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthenticated user attempted to retrieve Feedback.'
	})
	public search(
	@Query() queryParams: Record<string, any>,
		@Body('q') query: any = {},
		@Body('s') search = null
	) {
		return this.feedbackService.search(queryParams, query, search);
	}
}
