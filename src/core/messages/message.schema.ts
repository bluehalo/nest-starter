import { index, modelOptions, plugin, prop, Ref } from '@typegoose/typegoose';
import { RefType } from '@typegoose/typegoose/lib/types';

import { PagingSearch, PagingSearchPlugin } from '../../common/mongoose/paging-search.plugin';
import { User } from '../user/user.schema';

export enum MessageType {
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR',
	MOTD = 'MOTD'
}

@modelOptions({
	schemaOptions: {
		collection: 'messages',
		timestamps: {
			createdAt: 'created',
			updatedAt: 'updated'
		}
	}
})
@plugin(PagingSearchPlugin)
@index({ title: 'text', body: 'text', type: 'text' })
export class Message extends PagingSearch {
	_id: RefType;

	@prop({ required: true, trim: true })
	title!: string;

	@prop({ required: true, enum: MessageType })
	type!: string;

	@prop({ required: true, trim: true })
	body!: string;

	@prop()
	ackRequired: boolean;

	@prop({ index: true, required: true, ref: 'User' })
	creator: Ref<User>;

	public created!: Readonly<Date>;
	public updated!: Readonly<Date>;

	static auditCopy(message) {
		if (!message) {
			return {};
		}
		return message.toObject();
	}
}
