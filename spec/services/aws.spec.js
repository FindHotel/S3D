const chai = require('chai');
const expect = chai.expect;
const rewire = require('rewire');

describe('aws service', () => {
  beforeEach(() => {
    this.subject = rewire('./../../lib/services/aws');
  });

  describe('load', () => {
    it('correctly loads service', () => {
      expect(this.subject).to.not.be.a('undefined');
    });
  });
});
