const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use('/public/images', express.static('public/images'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const generateRandomString = () => {
  let randomID = '';
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  for (let i = 0; i < 6; i++) {
    randomID += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return randomID;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



// Post Definitions
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  let longURL = req.body.newLongURL;

  if (!longURL.includes('http://')) {

    if (!longURL.includes('www.')) {
      longURL = "www." + longURL;
    }

    longURL = 'http://' + longURL;
  }

  urlDatabase[req.params.id] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/urls", (req, res) => {
  let uniqueID = generateRandomString();
  let longURL = req.body.longURL;

  if (!longURL.includes('http://')) {

    if (!longURL.includes('www.')) {
      longURL = "www." + longURL;
    }

    longURL = 'http://' + longURL;
  }

  urlDatabase[uniqueID] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${uniqueID}`);
});



app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// Route Definitions
app.get("/u/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };

  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };

  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };

  res.render('urls_index', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});