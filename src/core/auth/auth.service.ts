import { Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService) {}

	async validateUser(username: string, pass: string): Promise<any> {
		const user = await this.userService.findOne(username);
		if (user?.authenticate(pass)) {
			const { password, salt, ...result } = user.toObject();
			return result;
		}
		return null;
	}
}
