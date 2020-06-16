import { index, modelOptions, prop, Ref } from '@typegoose/typegoose';

import { User } from '../user/user.schema';

import { Message } from './message.schema';

@modelOptions({
	schemaOptions: {
		collection: 'messages.dismissed',
		timestamps: {
			createdAt: 'created',
			updatedAt: 'updated'
		}
	}
})
@index({ title: 'text', body: 'text', type: 'text' })
@index({ created: -1 }, { expireAfterSeconds: 2592000 })
export class DismissedMessage {
	@prop({ required: true, ref: 'User' })
	messageId: Ref<Message>;

	@prop({ index: true, required: true, ref: 'User' })
	userId: Ref<User>;

	public created!: Readonly<Date>;

	static auditCopy(message) {
		if (!message) {
			return {};
		}
		return message.toObject();
	}
}
