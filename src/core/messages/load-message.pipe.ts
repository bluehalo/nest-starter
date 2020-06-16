import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { DocumentType } from '@typegoose/typegoose';

import { MessagesService } from './messages.service';
import { Message } from './message.schema';

@Injectable()
export class LoadMessagePipe implements PipeTransform {
	constructor(private readonly messagesService: MessagesService) {}

	async transform(value: string): Promise<DocumentType<Message>> {
		const eua = await this.messagesService.read(value);
		if (eua == null) {
			throw new BadRequestException({
				type: 'error',
				message: 'Message does not exist'
			});
		}
		return eua;
	}
}
