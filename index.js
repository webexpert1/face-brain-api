const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

// add kenex
const db = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '!pass4sure',
      database : 'smart-brain'
    }
  });

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 4001; 

app.get('/', (req, res)=> {
    db.select('*').from('users').then(data => res.json(data))
});

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash); 
            if(isValid) {
               return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                  .catch(err => res.status(400).json('unable to get user'))
            } else {
                res.status(400).json('Wrong Credentials');
            }
        })
        .catch(err => res.status(400).json('Wrong credentials'))
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    const hash = bcrypt.hashSync(password, saltRounds);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    name: name,
                    email: loginEmail[0],
                    joined: new Date()
                }).then(user => {
                    res.json(user[0]);
                })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('Unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users')
      .where({id: id})
      .then(user => {
        if(user.length) {
            res.json(user[0]);
        } else {
            res.status(400).json('not found')
        }
        
    })
    .catch(err => res.status(400).json('Error getting user'))
}) 
 
app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json('unable to get count'));
})

app.listen(port, () => {
    console.log(`app is runing on port ${port}`);
});