import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { User } from '../../../user/user.schema';
import { DynamicAuthPlugin } from '../dynamic.strategy';
import {AuthService} from "../../auth.service";

@Injectable()
export class LocalPlugin extends DynamicAuthPlugin {
	constructor(private readonly authService: AuthService) {
		super();
	}

	async validate(req: Request): Promise<User> {
		const username = req.body['username'] as string;
		const password = req.body['password'] as string;

		if ((username?.length ?? 0) === 0) {
			throw new BadRequestException({
				type: 'missing-credentials',
				message: 'No username provided'
			});
		}

		const user = await this.authService.validateUser(username, password);
		if (!user) {
			throw new UnauthorizedException({
				type: 'invalid-credentials',
				message: 'Incorrect username or password'
			});
		}

		delete user.password;
		delete user.salt;
		return user;
	}
}
