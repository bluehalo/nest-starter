import { DismissedMessage } from './dismissed-message.schema';

describe('DismissedMessageSchema', () => {
	it('should be defined', () => {
		expect(new DismissedMessage()).toBeDefined();
	});
});
