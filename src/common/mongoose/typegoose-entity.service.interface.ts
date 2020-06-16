import { DocumentType } from '@typegoose/typegoose';

import { User } from '../../core/user/user.schema';

export interface TypegooseEntityService<T, CreateDTO, UpdateDTO> {
	create(dto: CreateDTO, currentUser: User): Promise<DocumentType<T>>;

	read(id: string, populate: any[]): Promise<DocumentType<T>>;

	update(eua: DocumentType<T>, dto: UpdateDTO): Promise<DocumentType<T>>;

	remove(eua: DocumentType<T>): Promise<DocumentType<T>>;

	search(queryParams, query: Record<string, any>, search: string): Promise<any>;
}
