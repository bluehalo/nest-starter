import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';

import { UtilService } from '../../common/util.service';
import { TypegooseEntityService } from '../../common/mongoose/typegoose-entity.service.interface';
import { ConfigService } from '../config/config.service';

import { UserDto } from './dto/user-dto';
import { User } from './user.schema';

@Injectable()
export class UserService implements TypegooseEntityService<User, UserDto, UserDto> {
	constructor(
		@InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
		private readonly configService: ConfigService
	) {}

	create(dto: UserDto): Promise<DocumentType<User>> {
		const createdUser = new this.userModel(dto);

		const authStrategy = this.configService.getConfig().auth.strategy;
		if (authStrategy === 'proxy-pki') {
			createdUser.provider = 'pki';

			if (null != dto.username) {
				createdUser.providerData = { dn: dto.username, dnLower: dto.username.toLowerCase() };
			}
		} else if (authStrategy === 'local') {
			createdUser.provider = 'local';

			// Need to set null passwords to empty string for mongoose validation to work
			if (null == createdUser.password) {
				createdUser.password = '';
			}
		}

		this.initializeNewUser(createdUser);

		return createdUser.save();
	}

	read(id: string, populate: any[] = []): Promise<DocumentType<User>> {
		return this.userModel
			.findOne({ _id: id }, '-salt -password')
			.populate(populate)
			.exec();
	}

	update(user: DocumentType<User>, dto: UserDto): Promise<DocumentType<User>> {
		// Copy over the new user properties
		user.name = dto.name;
		user.organization = dto.organization;
		user.email = dto.email;
		// user.phone = dto.phone;
		user.username = dto.username;
		user.roles = dto.roles;
		// user.bypassAccessCheck = dto.bypassAccessCheck;

		if (typeof dto.password === 'string' && !_.isEmpty(dto.password)) {
			user.password = dto.password;
		}

		return user.save();
	}

	remove(user: DocumentType<User>): Promise<DocumentType<User>> {
		return user.remove();
	}

	async search(
		queryParams: Record<string, any>,
		query: any = {},
		search: string = null
	): Promise<any> {
		const page = UtilService.getPage(queryParams);
		const limit = UtilService.getLimit(queryParams, 100);
		const sortArr = UtilService.getSort(queryParams);
		const offset = page * limit;

		const result = await this.userModel.textSearch(
			query,
			search,
			limit,
			offset,
			sortArr,
			true,
			'-salt -password'
		);

		return UtilService.getPagingResults(limit, page, result.count, result.results);
	}

	async adminSearch(
		queryParams: Record<string, any>,
		query: any = {},
		search: string = null
	): Promise<any> {
		const result = await this.search(queryParams, query, search);

		result.elements = result.elements.map(element => User.fullCopy(element));

		return result;
	}

	findOne(username: string): Promise<DocumentType<User>> {
		return this.userModel.findOne({ username }).exec();
	}

	findOneById(id: string): Promise<DocumentType<User>> {
		return this.userModel.findOne({ _id: id }, '-salt -password').exec();
	}

	initializeNewUser(user: DocumentType<User>): DocumentType<User> {
		// Add the default roles
		user.roles = Object.assign(user.roles ?? {}, this.configService.getConfig().auth.defaultRoles);
		return user;
	}
}
