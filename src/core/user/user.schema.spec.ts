import { User } from './user.schema';

describe('User', () => {
	it('should be defined', () => {
		expect(new User()).toBeDefined();
	});
});
