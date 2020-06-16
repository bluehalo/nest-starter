import { index, modelOptions, plugin, prop } from '@typegoose/typegoose';

import { PagingSearch, PagingSearchPlugin } from '../../common/mongoose/paging-search.plugin';

@modelOptions({
	schemaOptions: {
		collection: 'useragreements',
		timestamps: {
			createdAt: 'created',
			updatedAt: 'updated'
		}
	}
})
@plugin(PagingSearchPlugin)
@index({ title: 'text', text: 'text' })
export class Eua extends PagingSearch {
	@prop({ required: true, trim: true })
	title!: string;

	@prop({ required: true, trim: true })
	text!: string;

	@prop({ index: true })
	published: Date;

	public created!: Readonly<Date>;
	public updated!: Readonly<Date>;

	static auditCopy(eua) {
		if (!eua) {
			return {};
		}
		return eua.toObject();
	}
}
