import { Audit } from './audit.schema';

describe('AuditSchema', () => {
	it('should be defined', () => {
		expect(new Audit()).toBeDefined();
	});
});
