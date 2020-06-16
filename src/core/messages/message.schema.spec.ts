import { Message } from './message.schema';

describe('MessageSchema', () => {
	it('should be defined', () => {
		expect(new Message()).toBeDefined();
	});
});
