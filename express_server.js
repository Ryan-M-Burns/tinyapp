const { getUserURLs, getUserByEmail, generateRandomId } = require("./helpers");
const express = require('express');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ["&OFr9PD34o86De$^NdiW"], // randomly generated 20 character key

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");


// Future state will move these to a separate file for modularity
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


app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];

  if (!url) {
    return res.status(404).redirect("/404");
  }

  res.redirect(url.longURL);
});


app.get("/urls/new", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  if (!user) {
    return res.status(403).redirect("/login");
  }

  res.render("urls_new", { user });
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = users[req.session.userId];
  const url = urlDatabase[id];

  if (!url) {
    return res.status(404).redirect("/404");
  }

  if (!user) {
    return res.status(401).redirect("/401");
  }

  const templateVars = { id, user, longURL: url.longURL };

  res.render("urls_show", templateVars);
});

// added a couple common home calls
app.get(["/", "/urls", "/home"], (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  if (!user) {
    return res.status(401).redirect("/401");
  }

  const urls = getUserURLs(user.id, urlDatabase);
  const templateVars = { urls, user };

  res.render('urls_index', templateVars);
});


app.get("/register", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  if (user) {
    return res.redirect('/urls');
  }

  res.render('urls_registration', { user });
});


app.get("/login", (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  if (user) {
    return res.redirect('/urls');
  }

  res.render('urls_login', { user });
});

//set to capture any miskeys instead of throwing a cannot get /****d
app.get([/u/, "/404"], (req, res) => {
  const id = req.session.userId;
  const user = users[id];

  res.render('error_404', { user });
});


app.post("/urls/:id/delete", (req, res) => { 
  const id = req.session.userId;
  const user = users[id];

  if (!user) {
    return res.status(403).redirect('/403');
  }

  const urls = getUserURLs(user.id, urlDatabase);
  const deleteURL = urls[req.params.id];

  if (!deleteURL) {
    return res.status(403).redirect('/403');
  }

  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});


app.post("/urls/:id/edit", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  const urls = getUserURLs(user.id, urlDatabase);
  const editURL = urls[req.params.id];

  if (!editURL) {
    return res.redirect(403, '/403');
  }

  let editLongURL = req.body.newLongURL;
  // Included this code block to ensure proper URL formatting for consistency in URL database
  if (!editLongURL.includes('http://')) {
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
    return res.status(403).redirect("/403");
  }

  // if (!longURL.includes('http://')) {
  //   longURL = 'http://' + longURL;
  // }

  urlDatabase[id] = { longURL, userId };

  res.redirect(`/urls/${id}`);
});


app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);

  if (!req.body.email || !req.body.password) { // Form entry error
    return res.status(400).redirect('/400');
  }

  if (user === null) { // user returning null means the user either made an error in their email or the email doesn't exist
    return res.status(403).redirect("/403");
  }

  if (!bcrypt.compareSync(req.body.password, user.password)) { // Password check
    return res.status(403).redirect('/403');
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
  const newUser = getUserByEmail(req.body.email, users);

  if (!req.body.password || !req.body.email) { // Form entry error
    return res.status(400).redirect('/400');
  }

  if (newUser !== null) { // If new user does not return null it means that a user with that email already exists
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});