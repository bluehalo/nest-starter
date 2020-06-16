import { index, modelOptions, plugin, prop, Ref } from '@typegoose/typegoose';

import { PagingSearch, PagingSearchPlugin } from '../../common/mongoose/paging-search.plugin';
import { User } from '../user/user.schema';

@modelOptions({
	schemaOptions: {
		collection: 'feedback',
		timestamps: {
			createdAt: 'created',
			updatedAt: 'updated'
		}
	}
})
@plugin(PagingSearchPlugin)
@index({ body: 'text' })
export class Feedback extends PagingSearch {
	@prop()
	body: string;

	@prop({ index: true })
	type: string;

	@prop({ index: true })
	url: string;

	@prop({ index: true })
	os: string;

	@prop({ index: true })
	browser: string;

	@prop()
	classification: string;

	@prop({ index: true, required: true, ref: 'User' })
	creator: Ref<User>;

	public created!: Readonly<Date>;
}
