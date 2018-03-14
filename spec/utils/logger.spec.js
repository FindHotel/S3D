const chai = require('chai');
const expect = chai.expect;
const rewire = require('rewire');

describe('logger utils', () => {
  beforeEach(() => {
    this.subject = rewire('./../../lib/utils/logger');
  });

  describe('load', () => {
    it('correctly loads logger', () => {
      expect(this.subject).to.not.be.a('undefined');
    });
  });
});
