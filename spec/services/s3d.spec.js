const chai = require('chai');
const expect = chai.expect;
const rewire = require('rewire');

describe('main service', () => {
  beforeEach(() => {
    this.subject = rewire('./../../lib/services/s3d');
  });

  describe('load', () => {
    it('correctly loads service', () => {
      expect(this.subject).to.not.be.a('undefined');
    });
  });
});
