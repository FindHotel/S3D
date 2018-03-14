const chai = require('chai');
const expect = chai.expect;
const rewire = require('rewire');

describe('dynamo service', () => {
  beforeEach(() => {
    this.subject = rewire('./../../lib/services/dynamo');
  });

  describe('load', () => {
    it('correctly loads service', () => {
      expect(this.subject).to.not.be.a('undefined');
    });
  });
});
