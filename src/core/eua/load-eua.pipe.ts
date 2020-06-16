import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { DocumentType } from '@typegoose/typegoose';

import { EuaService } from './eua.service';
import { Eua } from './eua.schema';

@Injectable()
export class LoadEuaPipe implements PipeTransform<string, Promise<DocumentType<Eua>>> {
	constructor(private readonly euaService: EuaService) {}

	async transform(value: string): Promise<DocumentType<Eua>> {
		const eua = await this.euaService.read(value);
		if (eua == null) {
			throw new BadRequestException({
				type: 'error',
				message: 'End User Agreement does not exist'
			});
		}
		return eua;
	}
}
