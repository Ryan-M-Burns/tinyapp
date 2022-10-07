const express = require('express');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080

app.use('/public/images', express.static('public/images'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ["&OFr9PD34o86De$^NdiW"],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

// Function Definitions
const getUserURLs = (id) => {
  const urls = {};

  for (let urlKey in urlDatabase) {
    console.log("urlDatabase", urlDatabase, "urlDatabase[urlKey].userID", urlDatabase[urlKey].userId);
    if (urlDatabase[urlKey].userId === id) {
      urls[urlKey] = urlDatabase[urlKey];
    }

  }

  return urls;
};

const isError = (req, res, user) => {

  if (!req.body.email || !req.body.password) {
    res.status(400).redirect('/400');
    return true;
  }



  return false;
};

const findUserByEmail = (email, usersDatabase) => {

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


const users = {

  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$zwmwSN8L6WSgndZokygwNuFsQhgW7RoJ1kVvVO8YHWuZJjacPrDX2" // purple-monkey-dinosaur
  },

  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$3YccG9RQPypeFgJynBC5kONm2xosPbYY3wcxXEqVe/u0Wd2YbESR2" // dishwasher-funk
  },

};

const urlDatabase = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "userRandomID"
  }

};


// Post Definitions
app.post("/urls/:id/delete", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  if (!user) {
    res.status(403).redirect('/403');
    return;
  }

  const urls = getUserURLs(user.id);
  let deleteURL = urls[req.params.id];

  if (!deleteURL) {
    res.status(403).redirect('/403');
    return;
  }

  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});


app.post("/urls/:id/edit", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  const urls = getUserURLs(user.id);
  let editURL = urls[req.params.id];

  if (!editURL) {
    res.redirect(403, '/403');
    return;
  }
  let editLongURL = req.body.newLongURL;

  if (!editLongURL.includes('http://')) {

    if (!editLongURL.includes('www.')) {
      editLongURL = "www." + editLongURL;
    }

    editLongURL = 'http://' + editLongURL;
  }

  urlDatabase[req.params.id].longURL = editLongURL;
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});


app.post("/urls", (req, res) => {
  const id = generateRandomId();
  let longURL = req.body.longURL;
  const userId = req.session.userId;
  const user = users[userId];

  if (!user) {
    res.status(403).redirect("/403");
    return;
  }

  if (!longURL.includes('http://')) {

    if (!longURL.includes('www.')) {
      longURL = "www." + longURL;
    }

    longURL = 'http://' + longURL;
  }

  urlDatabase[id] = { longURL, userId };
  console.log("urlDatabase:", urlDatabase);
  res.redirect(`/urls/${id}`);
});


app.post("/login", (req, res) => {
  let user = findUserByEmail(req.body.email, users);

  if (!req.body.email || !req.body.password) {
    res.status(400).redirect('/400');
    return;
  }

  if (user === null) {
    res.status(403).redirect("/403");
    return;
  }

  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).redirect('/403');
    return;
  }

  req.session.userId = user.id;
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


app.post("/register", (req, res) => {
  const newUserId = generateRandomId();
  let newUser = findUserByEmail(req.body.email, users);

  if (!req.body.password || !req.body.email) {
    res.status(400).redirect('/400');
    return;
  }

  if (newUser !== null) {
    return res.status(403).redirect("/403");
  }

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[newUserId] = {
    id: newUserId,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.userId = newUserId;
  res.redirect('/urls');
});


// Route Definitions
app.get("/400", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  res.render('error_400', { user });
});

app.get("/401", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  res.render('error_401', { user });
});

app.get("/403", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  res.render('error_403', { user });
});

app.get("/404", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  res.render('error_404', { user });
});

app.get("/u/:id", (req, res) => {
  console.log("req.params.id", req.params.id, "req.params", req.params, "req.body", req.body);
  const url = urlDatabase[req.params.id];

  if (!url) {
    res.status(404).redirect("/404");
    return;
  }

  res.redirect(url.longURL);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  if (!user) {
    res.status(403).redirect("/login");
    return;
  }

  res.render("urls_new", { user });
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = users[req.session.userId];
  const url = urlDatabase[id];

  if (!url) {
    res.status(403).redirect("/404");
    return;
  }

  const templateVars = { id, user, longURL: url.longURL };

  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  if (!user) {
    res.status(401).redirect("/401");
    return;
  }

  const urls = getUserURLs(user.id);
  console.log("urls:", urls);
  const templateVars = { urls, user };

  res.render('urls_index', templateVars);
});


app.get("/register", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  if (user) {
    res.redirect('/urls');
    return;
  }

  res.render('urls_registration', { user });
});


app.get("/login", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  if (user) {
    res.redirect('/urls');
    return;
  }

  res.render('urls_login', { user });
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});