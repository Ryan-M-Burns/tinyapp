const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use('/public/images', express.static('public/images'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
const findUser = (email) => {
  for(let user in users) {
    if(user[email] === email) {
      return null;
    }
  }
  return users;
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
  let uniqueID = generateRandomID();
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
  res.clearCookie('user_ID');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  newUserID = generateRandomID();

  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie('user_ID', newUserID);
  res.redirect('/urls');
});

// Route Definitions
app.get("/u/:id", (req, res) => {
  const templateVars = {
    user_ID: req.cookies["user_ID"],
    users
  };

  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_ID: req.cookies["user_ID"],
    users
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_ID: req.cookies["user_ID"],
    users
  };

  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_ID: req.cookies["user_ID"],
    users
  };
  templateVars

  res.render('urls_index', templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user_ID: req.cookies["user_ID"],
    users
  };

  res.render('urls_registration', templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user_ID: req.cookies["user_ID"],
    users
  };

  res.render('urls_login', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});