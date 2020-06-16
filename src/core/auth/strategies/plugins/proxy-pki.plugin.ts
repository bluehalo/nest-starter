import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { Request } from 'express';

import { AuthService } from '../../auth.service';
import { User } from '../../../user/user.schema';
import { DynamicAuthPlugin } from '../dynamic.strategy';

@Injectable()
export class ProxyPkiPlugin extends DynamicAuthPlugin {
	static readonly USER_HEADER = 'x-ssl-client-s-dn';
	static readonly PROXIED_USER_HEADER = 'x-proxied-user-dn';

	constructor(private readonly authService: AuthService) {
		super();
	}

	async validate(req: Request): Promise<User> {
		const primaryUserDn = this.extractHeaderValue(req, ProxyPkiPlugin.USER_HEADER);

		// If there is no DN, we can't authenticate
		if (!primaryUserDn) {
			throw new BadRequestException({
				status: 400,
				type: 'missing-credentials',
				message: 'Missing certificate'
			});
		}

		const primaryUser = await this.authService.validateUserProxy(primaryUserDn, req);

		const proxiedUserDn = this.extractHeaderValue(req, ProxyPkiPlugin.PROXIED_USER_HEADER);

		if (!proxiedUserDn) {
			return primaryUser;
		}

		if (!primaryUser.canProxy) {
			throw new ForbiddenException({
				status: 403,
				type: 'authentication-error',
				message: 'Not approved to proxy users. Please verify your credentials.'
			});
		}

		const proxiedUser = await this.authService.validateUserProxy(proxiedUserDn, req, true);

		proxiedUser.externalGroups = _.intersection(
			primaryUser.externalGroups,
			proxiedUser.externalGroups
		);
		proxiedUser.externalRoles = _.intersection(
			primaryUser.externalRoles,
			proxiedUser.externalRoles
		);

		return proxiedUser;
	}

	private extractHeaderValue(req: Request, header: string): string | undefined {
		const value = req.headers[header];
		if (typeof value === 'string') {
			return value;
		}
		return value?.[0];
	}
}
