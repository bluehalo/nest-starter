import { Controller, Get, HttpStatus, Post, Redirect, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { User } from '../user/user.schema';

import { LoginGuard } from './guards/login.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { CurrentUser } from './current-user.decorator';

@ApiTags('Auth')
@Controller('')
export class AuthController {
	@UseGuards(LoginGuard)
	@Post('/auth/signin')
	@ApiOperation({ description: 'Signs in the user.' })
	@ApiResponse({ status: HttpStatus.OK, description: "The authenticated user's profile" })
	login(@CurrentUser() user: User): User {
		return user;
	}

	@Get('/auth/signout')
	@Redirect('/')
	@ApiOperation({ description: 'Signs out the user.' })
	@ApiResponse({ status: HttpStatus.OK, description: 'User was signed out.' })
	logout(@Request() req: Express.Request): void {
		req.logout();
	}

	@UseGuards(AuthenticatedGuard)
	@Get('/user/me')
	getProfile(@CurrentUser() user: User): User {
		return user;
	}
}
