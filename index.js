import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Authentication",
  password: "abc123",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});



app.post("/registeration", async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    let errorOccur = false;
    
    let error = "";

    if(username.includes(" ")){
        error = "Username can not include blank spaces";
        res.render("register.ejs", {error: error});
    }

    try{
        await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, password]);
    } catch(err){
        console.log(err.constraint);
        errorOccur = true;

        if(err.constraint === "unique_username"){
            error = "Username is already registered";
        }
        else if(err.constraint === "unique_email"){
            error = "Email is already registered";
        }
    }
    
    if(!errorOccur){
        res.redirect("/login");
    }
    else{
        res.render("register.ejs", {error: error});
    }
    
});

app.get("/login", (req, res) => {
    


    res.render("login.ejs");
});

app.post("/submitlogin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let errorOccur = false;

    let user = "";

    try{
        user = (await db.query("SELECT username FROM users WHERE email = $1 AND password = $2", [email, password])).rows[0].username;
        console.log(user);
    } catch(err){
        console.log(err);
        errorOccur = true;
    }

    if(errorOccur){
        res.render("login.ejs", {error: "Invalid Credentials"});
    }
    else{
        res.redirect(`/home?user=${user}`);
    }
});

app.get("/home", (req, res) => {

    const user = req.query.user;
    console.log(user);
    res.render("index.ejs", {username: user});

});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});