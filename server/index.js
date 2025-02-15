const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Google Authentification
const CLIENT_ID = '22705282070-u8depo5tckdvp7damoi2sjpcscttjo9u.apps.googleusercontent.com';
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//Middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Welcome to BruinStreetMap Node.js Server');
});

app.get('/login', (req,res) =>{
  res.render('login');
});

app.post('/login', (req,res) => {
  let token = req.body.token;

  console.log(token);

  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    console.log(payload);
  }
  verify().then(()=>
  {
    res.cookie('session-token',token );
    res.send('success');
  }).catch(console.error);


});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

