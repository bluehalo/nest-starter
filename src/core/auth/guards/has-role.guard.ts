import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { memoize } from '@nestjs/passport/dist/utils/memoize.util';

export type IHasRoleGuard = CanActivate;
export const HasRoleGuard: (type?: string | string[]) => Type<IHasRoleGuard> = memoize(
	createHasRoleGuard
);

function createHasRoleGuard(role: string): Type<CanActivate> {
	class MixinHasRoleGuard implements CanActivate {
		async canActivate(context: ExecutionContext): Promise<boolean> {
			const request = context.switchToHttp().getRequest();
			return request.user.roles[role];
		}
	}
	const guard = mixin(MixinHasRoleGuard);
	return guard;
}

export const HasUserRoleGuard = HasRoleGuard('user');

export const HasAdminRoleGuard = HasRoleGuard('admin');

export const HasEditorRoleGuard = HasRoleGuard('editor');

export const HasAuditorRoleGuard = HasRoleGuard('auditor');

export type IAnyGuard = CanActivate;
export const AnyGuard: (...guards: CanActivate[]) => Type<IAnyGuard> = memoize(createAnyGuard);

function createAnyGuard(...guards: CanActivate[]): Type<CanActivate> {
	class MixinAnyGuard implements CanActivate {
		async canActivate(context: ExecutionContext): Promise<boolean> {
			return guards.some(guard => guard.canActivate(context));
		}
	}
	const guard = mixin(MixinAnyGuard);
	return guard;
}

export type IAllGuard = CanActivate;
export const AllGuard: (...guards: CanActivate[]) => Type<IAllGuard> = memoize(createAllGuard);

function createAllGuard(...guards: CanActivate[]): Type<CanActivate> {
	class MixinAllGuard implements CanActivate {
		async canActivate(context: ExecutionContext): Promise<boolean> {
			return guards.every(guard => guard.canActivate(context));
		}
	}
	const guard = mixin(MixinAllGuard);
	return guard;
}
