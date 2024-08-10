const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
var sessions=require('express-session');
const app = express();
const port = 6789;
const cookieParser=require('cookie-parser');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('cumparaturi.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the cumparaturi database.');
});
// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului
//este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client
//(e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în
//format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));
// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello
//World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.use(cookieParser());
var session;
app.use(sessions({
  secret:'secret',
  resave:false,
  saveUninitialized:false,
  cookie:{
  maxAge:10000
  }}));
app.get('/logout',(req,res)=>{
  session=req.session;
  session.destroy();
  res.redirect('/');
}
);
app.get('/', (req, res) => {
    session= req.session;
       db.serialize(() => {
         db.all(`SELECT * FROM produse`, (err, rows) => {
           if (err) {
             console.error(err.message);
             res.render('index',{data:''});
           }
           else{
            res.render('index',{username:req.cookies.username,data:rows,session:session});
            //  res.cookie('ids',ids);
            //  res.cookie('names',names);
            //  res.cookie('qtys',qtys);
          }
         });
       });
});
app.get('/autentificare', (req, res) => res.render('autentificare',{mesajEroare:req.cookies.mesajEroare,login:login}));

var listaIntrebari;
'use strict';
        const fs = require('fs');

        fs.readFile('intrebari.json', (err, data) => {
            if (err) throw err;
            listaIntrebari = JSON.parse(data);
        });

var listaUsers;
'use strict';
        const fs1 = require('fs');

        fs1.readFile('utilizatori.json', (err, data) => {
            if (err) throw err;
            listaUsers = JSON.parse(data);
        });
// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția
//specificată
app.get('/chestionar', (req, res) => {
  
        // în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care
       //conține vectorul de întrebări
        console.log("mda");
        res.render('chestionar', {questions: listaIntrebari});

});

       app.post('/rezultat-chestionar', (req, res) => {
        const raspunsuri = req.body;
        let nrRaspCorecte = 0;
        for (let i = 0; i < listaIntrebari.intrebari.length; i++) {
            if (listaIntrebari.intrebari[i].corect === raspunsuri['intrebare'+ i]) {
                nrRaspCorecte++;
            }
        }
        res.render('rezultat-chestionar', {questions:listaIntrebari,raspunsuri:raspunsuri, nrRaspCorecte:nrRaspCorecte , nrIntrebari:listaIntrebari.intrebari.length});
    });
    var login= true;
       app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`+port));
       app.post('/verificare-autentificare', (req, res) => {
        let ok=0;
        let mesajEroare='';
        const dateFormular = req.body;
        login=false;
      for(let i=0;i<listaUsers.utilizatori.length;i++){
        if (dateFormular.username === listaUsers.utilizatori[i].username && dateFormular.password === listaUsers.utilizatori[i].password){
            login=true;
        }
      }
        if(login==true){
            session=req.session;
            session.username=req.body.username;
            res.cookie('username', dateFormular.username);
            res.redirect('/');

        }
        else{
          res.cookie('mesajEroare',"Autentificare esuata");
          res.redirect('autentificare');
        }

       });
       app.get('/creare-bd', (req, res) => {
          db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS produse(id int UNIQUE,
                name varchar(20),
                qty int
                )`, (err, row) => {
              if (err) {
                console.error(err.message);
              }
            });
          });
          res.redirect('/');
       });
       app.get('/inserare-bd', (req, res) => {
          db.serialize(() => {
            db.run(`INSERT INTO produse (id,name,qty) VALUES (1,'Harry Potter si Piatra Filosofala',3),
                                                            (2,'Harry Potter si Camera Secretelor', 2)`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    }
            });
          });
          res.redirect('/');
       });
