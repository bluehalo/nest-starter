import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { User } from '../../user/user.schema';

export abstract class DynamicAuthPlugin {
	abstract validate(req: Request): Promise<User>;
}

@Injectable()
export class DynamicStrategy extends PassportStrategy(Strategy, 'dynamic') {
	constructor(private readonly plugin: DynamicAuthPlugin) {
		super();
	}

	async validate(req: Request): Promise<User> {
		return this.plugin.validate(req);
	}
}
