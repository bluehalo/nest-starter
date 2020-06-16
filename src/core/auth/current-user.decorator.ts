import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UtilService } from '../../common/util.service';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();

	// Extract IP address and add to user so it is available for auditing
	request.user.ip = UtilService.getHeaderField(request.headers, 'x-real-ip');

	return request.user;
});
