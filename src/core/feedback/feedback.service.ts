import { Injectable } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';

import { UtilService } from '../../common/util.service';

import { CreateFeedbackDto } from './dto/create-feedback-dto';
import { Feedback } from './feedback.schema';

@Injectable()
export class FeedbackService {
	constructor(
		@InjectModel(Feedback)
		private readonly feedbackModel: ReturnModelType<typeof Feedback>
	) {}

	create(
		createFeedbackDto: CreateFeedbackDto,
		userAgent: { browser?: string; os?: string }
	): Promise<DocumentType<Feedback>> {
		const createdFeedback = new this.feedbackModel(createFeedbackDto);
		createdFeedback.browser = userAgent.browser;
		createdFeedback.os = userAgent.os;

		try {
			return createdFeedback.save();
		} catch (err) {
			// Log and continue the error
			// logger.error({err: err, feedback: newFeedback}, 'Error trying to persist feedback record to storage.');
			return Promise.reject(err);
		}
	}

	async search(
		queryParams: Record<string, any>,
		query: any = {},
		search: string = null
	): Promise<any> {
		const page = UtilService.getPage(queryParams);
		const limit = UtilService.getLimit(queryParams, 100);
		const sortArr = UtilService.getSort(queryParams);
		const offset = page * limit;

		const result = await this.feedbackModel.textSearch(
			query,
			search,
			limit,
			offset,
			sortArr,
			true,
			{
				path: 'creator',
				select: ['name', 'email']
			}
		);

		return UtilService.getPagingResults(limit, page, result.count, result.results);
	}
}
