import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { DocumentType } from '@typegoose/typegoose';

import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';
import { ConfigService } from '../config/config.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly configService: ConfigService,
		private readonly auditService: AuditService,
		private readonly userService: UserService
	) {}

	async validateUser(username: string, pass: string): Promise<any> {
		const user = await this.userService.findOne(username);
		if (user?.authenticate(pass)) {
			const result = user.toObject();
			delete result.salt;
			delete result.password;

			return result;
		}
		return null;
	}

	async validateUserProxy(dn: string, req, isProxy = false) {
		const dnLower = dn.toLowerCase();

		const localUser: DocumentType<User> = await this.userService.read({
			'providerData.dnLower': dnLower
		});

		// Bypass AC check
		if (localUser?.bypassAccessCheck) {
			return localUser;
		}

		const acUser: any = {}; //await accessChecker.get(dnLower);

		// Default to creating accounts automatically
		const autoCreateAccounts = this.configService.getConfig()?.auth?.autoCreateAccounts ?? true;

		// If the user is not known locally, is not known by access checker, and we are creating accounts, create the account as an empty account
		if (null == localUser && null == acUser && (isProxy || !autoCreateAccounts)) {
			throw new UnauthorizedException({
				status: 401,
				type: 'invalid-credentials',
				message: 'Certificate unknown, expired, or unauthorized'
			});
		}

		// Else if the user is not known locally, and we are creating accounts, create the account as an empty account
		if (null == localUser && autoCreateAccounts) {
			// // Create the user
			// const newUser = await createUser(dn, acUser);

			// Send email for new user if enabled, no reason to wait for success
			if (this.configService.getConfig().coreEmails?.userSignupAlert?.enabled) {
				// userEmailService.signupEmail(newUser, req);
			}

			if (this.configService.getConfig().coreEmails?.welcomeEmail?.enabled) {
				// userEmailService.welcomeEmail(newUser, req);
			}

			// // Audit user signup
			// await auditService.audit(
			// 	'user signup',
			// 	'user',
			// 	'user signup',
			// 	{},
			// 	User.auditCopy(newUser));

			// return newUser;
		}

		// Else if the user is known locally, but not in access checker, update their user info to reflect
		const originalUser = User.auditCopy(localUser);
		if (null == acUser) {
			localUser.externalRoles = [];
			localUser.externalGroups = [];
		} else {
			// Else if the user is known locally and in access checker, update their user info
			localUser.name = acUser.name?.trim() || localUser.name;
			localUser.organization = acUser.organization?.trim() || localUser.organization;
			localUser.email = acUser.email?.trim() || localUser.email;
			localUser.username = acUser.username?.trim() || localUser.username;
			localUser.externalRoles = acUser.roles;
			localUser.externalGroups = acUser.groups;
		}
		await localUser.save();

		// Audit user update
		await this.auditService.audit(
			'user updated from access checker',
			'user',
			'update',
			User.auditCopy(originalUser),
			User.auditCopy(localUser)
		);

		// Treat the proxied user account as if it's logging
		// in by updating their lastLogin time.
		if (
			isProxy &&
			(!localUser.lastLogin ||
				localUser.lastLogin + this.configService.getConfig().auth.sessionCookie.maxAge < Date.now())
		) {
			return this.userService.updateLastLogin(localUser);
		}

		return localUser;
	}
}
