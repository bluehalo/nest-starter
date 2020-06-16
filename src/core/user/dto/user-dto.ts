import { ApiProperty } from '@nestjs/swagger';

import { UserRoles } from '../user.schema';

export class UserDto {
	@ApiProperty({ example: 'Bob Robertson' })
	readonly name: string;

	@ApiProperty({ example: 'brobertson' })
	readonly username: string;

	@ApiProperty({ example: 'SomeOrg' })
	readonly organization: string;

	@ApiProperty({ example: 'brobertson@email.com' })
	readonly email: string;

	@ApiProperty({ example: 'abc123' })
	readonly password: string;

	@ApiProperty({ example: 'abc123' })
	readonly verifyPassword: string;

	@ApiProperty({ example: { user: true, editor: true, admin: true, auditor: false } })
	readonly roles: UserRoles;
}
