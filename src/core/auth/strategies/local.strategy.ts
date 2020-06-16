import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { User } from '../../user/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<User> {
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
		return user;
	}
}
