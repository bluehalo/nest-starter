import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { DocumentType } from '@typegoose/typegoose';

import { UserService } from './user.service';
import { User } from './user.schema';

@Injectable()
export class LoadUserPipe implements PipeTransform<string, Promise<DocumentType<User>>> {
	constructor(private readonly userService: UserService) {}

	async transform(value: string): Promise<DocumentType<User>> {
		const user = await this.userService.read(value);
		if (user == null) {
			throw new BadRequestException({ type: 'error', message: 'User does not exist' });
		}
		return user;
	}
}
