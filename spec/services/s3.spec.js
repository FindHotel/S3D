const chai = require('chai');
const expect = chai.expect;
const rewire = require('rewire');

describe('s3 service', () => {
  beforeEach(() => {
    this.subject = rewire('./../../lib/services/s3');
  });

  describe('load', () => {
    it('correctly loads service', () => {
      expect(this.subject).to.not.be.a('undefined');
    });
  });
});
