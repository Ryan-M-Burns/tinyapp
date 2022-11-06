const getUserURLs = (id, urls) => {
  const userURLs = {};

  for (let urlKey in urls) {
    if (urls[urlKey].userId === id) {
      userURLs[urlKey] = urls[urlKey];
    }

  }

  return userURLs;
};

const getUserByEmail = (email, usersDatabase) => {

  for (let keyId in usersDatabase) {
    let user = usersDatabase[keyId];

    if (user.email === email) {
      return user;
    }

  }
  return null;
};

const generateRandomId = () => {
  let randomId = '';
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

  for (let i = 0; i < 6; i++) {
    randomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return randomId;
};



module.exports = { getUserURLs, getUserByEmail, generateRandomId };