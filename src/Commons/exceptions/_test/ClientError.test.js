const ClientError = require('../ClientError');

describe('ClientError', () => {
  it('should throw error when directly use it', () => {
    expect(() => new ClientError('')).not.toThrowError('cannot instantiate abstract class');
  });
});
