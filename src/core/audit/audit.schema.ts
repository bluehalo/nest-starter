import { modelOptions, plugin, prop, Severity } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

import { PagingSearch, PagingSearchPlugin } from '../../common/mongoose/paging-search.plugin';

@modelOptions({
	schemaOptions: {
		collection: 'audit',
		timestamps: {
			createdAt: 'created',
			updatedAt: 'updated'
		}
	},
	options: {
		allowMixed: Severity.ALLOW
	}
})
@plugin(PagingSearchPlugin)
export class Audit extends PagingSearch {
	@prop()
	message: string;

	@prop({ type: Schema.Types.Mixed })
	audit: {
		auditType: string;
		action: string;
		actor: string;
		interfaceUrl: string;
		object: string;
		userSpec: {
			browser: string;
			os: string;
		};
	};

	public created!: Readonly<Date>;
}
