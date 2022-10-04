const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  let randomID = '';
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  for (let i = 0; i < 6; i++) {
    randomID += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return randomID;
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true}));

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let uniqueID = generateRandomString();
  urlDatabase[uniqueID] = req.body.longURL;
  res.redirect(`/urls/${uniqueID}`);
  res.send(`Ok, your shortURL is: ${uniqueID}`);  // Respond with Ok (We will replace this)
});

// Route Definitions
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <strong> World</strong></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});