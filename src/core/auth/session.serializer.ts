import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';
@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(private readonly userService: UserService) {
		super();
	}
	serializeUser(user: any, done: (err: Error, user: any) => void): any {
		done(null, user._id);
	}
	deserializeUser(payload: any, done: (err: Error, payload: string) => void): any {
		this.userService.findOneById(payload).then(
			user => {
				const { password, salt, ...result } = user.toObject();
				done(null, result);
			},
			err => {
				done(err, null);
			}
		);
	}
}
