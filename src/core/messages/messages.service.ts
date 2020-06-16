import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';

import { TypegooseEntityService } from '../../common/mongoose/typegoose-entity.service.interface';
import { UtilService } from '../../common/util.service';
import { User } from '../user/user.schema';

import { Message } from './message.schema';
import { MessageDto } from './dto/message-dto';
import { DismissedMessage } from './dismissed-message.schema';

@Injectable()
export class MessagesService implements TypegooseEntityService<Message, MessageDto, MessageDto> {
	constructor(
		@InjectModel(Message)
		private readonly messageModel: ReturnModelType<typeof Message>,
		@InjectModel(DismissedMessage)
		private readonly dismissedMessageModel: ReturnModelType<typeof DismissedMessage>
	) {}

	create(dto: MessageDto, currentUser: User): Promise<DocumentType<Message>> {
		const createdMessage: DocumentType<Message> = new this.messageModel(dto);
		createdMessage.creator = currentUser;
		return createdMessage.save();
	}

	read(id: string, populate = []): Promise<DocumentType<Message>> {
		return this.messageModel
			.findById(id)
			.populate(populate)
			.exec();
	}

	update(message: DocumentType<Message>, dto: MessageDto): Promise<DocumentType<Message>> {
		message.title = dto.title;
		message.type = dto.type;
		message.body = dto.body;
		return message.save();
	}

	remove(message: DocumentType<Message>): Promise<DocumentType<Message>> {
		return message.remove();
	}

	async search(
		queryParams: Record<string, any>,
		query: Record<string, any>,
		search: string
	): Promise<any> {
		const page = UtilService.getPage(queryParams);
		const limit = UtilService.getLimit(queryParams, 100);
		const sortArr = UtilService.getSort(queryParams);
		const offset = page * limit;

		const result = await this.messageModel.textSearch(query, search, limit, offset, sortArr);

		return UtilService.getPagingResults(limit, page, result.count, result.results);
	}

	// Get recent, unread messages
	async getRecentMessages(user: User): Promise<DocumentType<Message>[]> {
		const [messages, dismissedMessages] = await Promise.all([
			this.getAllMessages(),
			this.getDismissedMessages(user)
		]);

		return messages.filter(
			message => !dismissedMessages.some(x => x.messageId.toString() === message._id.toString())
		);
	}

	async dismissMessages(
		messageIds: string[],
		user: User
	): Promise<DocumentType<DismissedMessage>[]> {
		const promises = messageIds.map(messageId => {
			const dismissedMessage = new this.dismissedMessageModel({
				messageId,
				userId: user
			});

			return dismissedMessage.save();
		});

		return Promise.all(promises);
	}

	private getAllMessages(): Promise<DocumentType<Message>[]> {
		// const timeLimit = config.dismissedMessagesTimePeriod || 604800000;
		const timeLimit = 604800000;

		return this.messageModel.find({ created: { $gte: new Date(Date.now() - timeLimit) } }).exec();
	}

	private getDismissedMessages(user: User): Promise<DismissedMessage[]> {
		return this.dismissedMessageModel
			.find({ userId: user._id }, '_id')
			.lean()
			.exec();
	}
}
