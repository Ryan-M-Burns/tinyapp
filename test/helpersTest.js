const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },

  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }

};

describe('getUserByEmail', function() {
  
  it('should return null with email not in testUsers', function() {
    
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return a user with valid email', function() {
    
    const user = getUserByEmail("wheresWaldo@carmensandiego.world", testUsers);
    const expectedUserID = null;

    assert.strictEqual(user, expectedUserID);
  });
  
});