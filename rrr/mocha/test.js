var assert = require('assert');
const find =require('./findItem');
console.log(typeof(find.sat()))
describe('find', function () { 
    it('should return [] when the value is not present', function () {
      assert.equal(typeof(find.sat()),'object');
    });
});