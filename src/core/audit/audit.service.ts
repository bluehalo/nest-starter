import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';

import { UtilService } from '../../common/util.service';

import { Audit } from './audit.schema';

@Injectable()
export class AuditService {
	constructor(
		@InjectModel(Audit)
		private readonly auditModel: ReturnModelType<typeof Audit>
	) {}

	audit(
		message: string,
		eventType: string,
		eventAction: string,
		eventActor: any,
		eventObject: any,
		eventMetadata: any
	): Promise<Audit> {
		// Extract additional metadata to audit
		const userAgentObj = UtilService.getUserAgentFromHeader(eventMetadata);

		// Create audit record
		const newAudit = new this.auditModel({
			message: message,
			audit: {
				auditType: eventType,
				action: eventAction,
				actor: eventActor,
				userSpec: userAgentObj,
				object: eventObject
			}
		});

		// Send to bunyan logger for logfile persistence
		// auditLogger.audit(message, eventType, eventAction, actor, eventObject, userAgentObj);

		// Save to mongo
		try {
			return newAudit.save();
		} catch (err) {
			// Log and continue the error
			// logger.error({err: err, audit: newAudit}, 'Error trying to persist audit record to storage.');
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
		const sortArr = UtilService.getSort(queryParams, 'DESC', '_id');
		const offset = page * limit;

		const result = await this.auditModel.textSearch(query, search, limit, offset, sortArr);

		return UtilService.getPagingResults(limit, page, result.count, result.results);
	}

	async getDistinctValues(fieldToQuery: string): Promise<string[]> {
		try {
			return this.auditModel.distinct(fieldToQuery).exec();
		} catch (err) {
			// logger.error({err: err, req: req}, 'Error finding distinct values');
			// return util.send400Error(res, err);
			throw err;
		}
	}
}
