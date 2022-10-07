const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use('/public/images', express.static('public/images'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");

// Function Definitions
const getUserURLs = (ID) => {
  const urls = {};

  for (let urlKey in urlDatabase) {

    if (urlDatabase[urlKey].userID === ID) {
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

  if (user.password !== req.body.password) {
    res.status(403).redirect('/403');
    return true;
  }

  return false;
};

const findUserByEmail = (email) => {

  for (let keyID in users) {
    let user = users[keyID];

    if (user.email === email) {
      return user;
    }

  }
  return null;
};

const generateRandomID = () => {
  let randomID = '';
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

  for (let i = 0; i < 6; i++) {
    randomID += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return randomID;
};


const users = {

  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },

  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },

};

const urlDatabase = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }

};


// Post Definitions
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies.user_ID];
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
  const user = users[req.cookies.user_ID];
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
  const id = generateRandomID();
  let longURL = req.body.longURL;
  const userID = req.cookies.user_ID;
  const user = users[userID];

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

  urlDatabase[id] = { longURL, userID };

  res.redirect(`/urls/${id}`);
});


app.post("/login", (req, res) => {
  let user = findUserByEmail(req.body.email);

  if (user === null) {
    res.status(403).redirect("/403");
  }

  if (isError(req, res, user)) {
    return;
  }

  res.cookie("user_ID", user.id);
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_ID');
  res.redirect('/urls');
});


app.post("/register", (req, res) => {
  const newUserID = generateRandomID();
  let newUser = findUserByEmail(req.body.email);

  if (newUser !== null || !req.body.password || !req.body.email) {

    if (isError(req, res, newUser)) {
      return;
    }

  }

  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie('user_ID', newUserID);
  res.redirect('/urls');
});


// Route Definitions
app.get("/400", (req, res) => {
  const user = users[req.cookies.user_ID];

  res.render('error_400', { user });
});

app.get("/401", (req, res) => {
  const user = users[req.cookies.user_ID];

  res.render('error_401', { user });
});

app.get("/403", (req, res) => {
  const user = users[req.cookies.user_ID];

  res.render('error_403', { user });
});

app.get("/404", (req, res) => {
  const user = users[req.cookies.user_ID];

  res.render('error_404', { user });
});

app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];

  if (!url) {
    res.status(404).redirect("/404");
    return;
  }

  res.redirect(url.longURL);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_ID];

  if (!user) {
    res.status(403).redirect("/login");
    return;
  }

  res.render("urls_new", { user });
});


app.get("/urls/:id", (req, res) => {
  const id = req.cookies.user_ID;
  const user = users[id];
  const url = urlDatabase[req.params.id];

  if (!url) {
    res.status(403).redirect("/404");
    return;
  }

  const templateVars = { id, user, longURL: url.longURL };

  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_ID];

  if (!user) {
    res.status(401).redirect("/401");
    return;
  }

  const urls = getUserURLs(user.id);
  const templateVars = { urls, user };

  res.render('urls_index', templateVars);
});


app.get("/register", (req, res) => {
  const user = users[req.cookies.user_ID];

  if (user) {
    res.redirect('/urls');
    return;
  }

  res.render('urls_registration', { user });
});


app.get("/login", (req, res) => {
  const user = users[req.cookies.user_ID];

  if (user) {
    res.redirect('/urls');
    return;
  }

  res.render('urls_login', { user });
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});