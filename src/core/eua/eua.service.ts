import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';

import { UtilService } from '../../common/util.service';
import { TypegooseEntityService } from '../../common/mongoose/typegoose-entity.service.interface';

import { Eua } from './eua.schema';
import { EuaDto } from './dto/eua-dto';

@Injectable()
export class EuaService implements TypegooseEntityService<Eua, EuaDto, EuaDto> {
	constructor(
		@InjectModel(Eua)
		private readonly euaModel: ReturnModelType<typeof Eua>
	) {}

	create(dto: EuaDto): Promise<DocumentType<Eua>> {
		const createdEua = new this.euaModel(dto);
		return createdEua.save();
	}

	read(id: string, populate = []): Promise<DocumentType<Eua>> {
		return this.euaModel
			.findById(id)
			.populate(populate)
			.exec();
	}

	update(eua: DocumentType<Eua>, dto: EuaDto): Promise<DocumentType<Eua>> {
		eua.text = dto.text;
		eua.title = dto.title;
		return eua.save();
	}

	remove(eua: DocumentType<Eua>): Promise<DocumentType<Eua>> {
		return eua.remove();
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

		const result = await this.euaModel.textSearch(query, search, limit, offset, sortArr);

		return UtilService.getPagingResults(limit, page, result.count, result.results);
	}

	publishEua(eua: DocumentType<Eua>): Promise<Eua> {
		eua.published = new Date();
		return eua.save();
	}

	readCurrent(): Promise<Eua> {
		return this.euaModel
			.findOne({ published: { $ne: null, $exists: true } })
			.sort({ published: -1 })
			.exec();
	}
}
