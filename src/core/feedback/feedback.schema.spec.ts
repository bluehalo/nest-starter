import { Feedback } from './feedback.schema';

describe('FeedbackSchema', () => {
	it('should be defined', () => {
		expect(new Feedback()).toBeDefined();
	});
});
