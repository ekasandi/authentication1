import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "Testing1",
  port: 5432,
});
db.connect();


app.get("/", (req, res) => {
  res.render("home.ejs");
});


app.get("/login", (req, res) => {
  res.render("login.ejs");
});


app.get("/register", (req, res) => {
  res.render("register.ejs");
});


app.post("/register", async (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;

  const checkResult = await db.query("select * from users where email = $a", [userName])

  try{
    if (checkResult.rows.length > 0) { 
      console.log("Already registered, try to login !")
    } else {
        await db.query("insert into users (email, pass) select $1, $2", [userName, password]);
        res.render("secrets.ejs");
      } 
    } catch (err) {
      console.log(err);
  }
});


app.post("/login", async (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;

  const checkEmail = await db.query("select * from users where email = $1", [userName]) 


//console.log(checkEmail);
//console.log(checkPassword);

  if (checkEmail.rows.length > 0) {
    const checkPassword = checkEmail.rows[0].pass;
    if (checkPassword === password) {
      res.render("secrets.ejs");
    } else {
      res.send("Wrong password!");
      res.render("/login");
    }
  } else {
    res.send("Please register first!");
    res.render("/register");
  };

});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
