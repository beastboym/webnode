const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const app = express();
const port = 3000;

mongoose
  .connect("mongodb://localhost/server", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion réussie !"))
  .catch((err) => console.error("Impossible de se connecter au server", err));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
    });
    await user.save();
    res.send(`
            <p>Inscription réussie !</p>
            <button onclick="location.href='/login'">Se connecter</button>
            `);
  } catch {
    res.redirect("/register");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ firstName: req.body.firstName });
  if (user) {
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (validPassword) {
      res.send("Connexion réussie");
    } else {
      res.send(`
            <p>Mot de passe ou identifiant incorrect</p>
            <button onclick="location.href='/login'">Reessayer</button>
            `);
    }
  } else {
    res.send("Utilisateur non trouvé");
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
