import * as crypto from 'crypto';

import * as _ from 'lodash';
import { index, modelOptions, plugin, pre, prop, Severity } from '@typegoose/typegoose';
import { RefType } from '@typegoose/typegoose/lib/types';

import { PagingSearch, PagingSearchPlugin } from '../../common/mongoose/paging-search.plugin';
import { UtilService } from '../../common/util.service';

export type UserRoles = {
	user?: boolean;
	editor?: boolean;
	auditor?: boolean;
	admin?: boolean;
};

@pre<User>('save', function() {
	// If the password is modified and it is valid, then re- salt/hash it
	if (this.isModified('password') && this.validatePassword.call(this, this.password)) {
		this.salt = Buffer.from(crypto.randomBytes(16).toString('base64'), 'base64').toString();
		this.password = this.hashPassword(this.password);
	}
})
@modelOptions({
	schemaOptions: {
		timestamps: {
			createdAt: 'created',
			updatedAt: 'updated'
		},
		toObject: { getters: true },
		toJSON: { getters: true }
	},
	options: {
		allowMixed: Severity.ALLOW
	}
})
@plugin(PagingSearchPlugin)
@index({ name: 'text', email: 'text', username: 'text' })
export class User extends PagingSearch {
	_id: RefType;

	@prop({
		required: true,
		trim: true
	})
	name!: string;

	@prop({
		required: true,
		trim: true
	})
	organization!: string;

	@prop({
		required: true,
		trim: true
		// unique: 'This username is already taken',
	})
	username!: string;

	@prop({
		default: ''
		// validate: [validatePassword, passwordMessage]
	})
	password: string;

	@prop()
	salt: string;

	@prop({
		required: true
	})
	provider!: string;

	@prop({
		required: true,
		trim: true,
		match: [UtilService.emailMatcher, 'A valid email address is required']
	})
	email!: string;

	@prop({
		required: false,
		trim: true,
		default: '',
		match: [/.+@.+\..+/, 'A valid phone number and cellular provider is required']
	})
	phone: string;

	@prop()
	organizationLevels: any;

	@prop()
	providerData: any;

	@prop()
	additionalProvidersData: any;

	@prop()
	roles: {
		user?: boolean;
		editor?: boolean;
		auditor?: boolean;
		admin?: boolean;
	};

	@prop({
		default: false
	})
	canProxy?: boolean;

	@prop({
		default: []
	})
	externalGroups?: [];

	@prop({
		default: []
	})
	externalRoles?: [];

	@prop({
		default: false
	})
	bypassAccessCheck?: boolean;

	@prop({
		default: 0,
		type: Date
	})
	messagesAcknowledged?: number;

	@prop({
		default: Date.now,
		type: Date
	})
	alertsViewed?: number;

	@prop()
	resetPasswordToken?: string;

	@prop({
		get: UtilService.dateParse,
		set: v => v,
		type: Date
	})
	resetPasswordExpires?: number;

	@prop({
		default: null,
		get: UtilService.dateParse,
		set: v => v,
		type: Date
	})
	acceptedEua?: number;

	@prop({
		default: null,
		get: UtilService.dateParse,
		set: v => v,
		type: Date
	})
	lastLogin?: number;

	@prop({
		default: null,
		get: UtilService.dateParse,
		set: v => v,
		type: Date
	})
	newFeatureDismissed?: number;

	@prop()
	preferences: any;

	public ip?: string;

	public created!: Readonly<Date>;
	public updated!: Readonly<Date>;

	// Hash Password
	hashPassword(password): string {
		if (this.salt && password) {
			return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'SHA1').toString('base64');
		}
		return password;
	}

	// Authenticate a password against the user
	authenticate(password: string): boolean {
		return this.password === this.hashPassword(password);
	}

	validatePassword(password: string): boolean {
		// only care if it's local
		if (this.provider === 'local') {
			return null != password && password.length >= 6;
		}
		return true;
	}

	static fullCopy(user): any {
		const object = user.toObject();
		delete object.salt;
		delete object.password;

		return object;
	}

	static auditCopy(user: any) {
		const toReturn: any = {};
		user = user || {};

		toReturn._id = user._id;
		toReturn.name = user.name;
		toReturn.username = user.username;
		toReturn.organization = user.organization;
		toReturn.organizationLevels = user.organizationLevels;
		toReturn.email = user.email;
		toReturn.phone = user.phone;
		toReturn.messagesAcknowledged = user.messagesAcknowledged;
		toReturn.alertsViewed = user.alertsViewed;
		toReturn.newFeatureDismissed = user.newFeatureDismissed;
		toReturn.canProxy = user.canProxy;
		toReturn.ip = user.ip;

		toReturn.roles = _.cloneDeep(user.roles);
		toReturn.bypassAccessCheck = user.bypassAccessCheck;
		// toReturn.externalRoleAccess = userAuthorizationService.checkExternalRoles(user, config.auth);
		if (null != user.providerData && null != user.providerData.dn) {
			toReturn.dn = user.providerData.dn;
		}

		if (null != user.preferences) {
			toReturn.preferences = user.preferences;
		}

		return toReturn;
	}
}
