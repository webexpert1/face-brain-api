const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 4001; 

const database = { 
    users: [
        {
            id:'123',
            name: 'john',
            email: 'john@gmail.com',
            password:'cookies',
            entries: 0,
            joined: new Date()
        },  
        {
            id:'124',
            name: 'sally',
            email: 'sally@gmail.com',
            password:'bananas',
            entries: 0,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res)=> {
    res.send(database.users);
});

app.post('/signin', (req, res) => {
    if(req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
        return res.json(database.users[0]);
    }
    return res.status(400).json('error logging in');
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    database.users.push(
        {
            id:'125',
            name: name,
            email: email,
            password: password,
            entries: 0,
            joined: new Date()
        }
    )
   return res.json(database.users[database.users.length - 1]);
})

app.post('/profile/:id', (req, res) => {
    const { id } = req.params;
    const found = false;
    database.users.forEach(user => { 
        if(user.id === id) {
            return res.json(user);
            found = true;
        }
    })
    if(!found) {
        res.status(404).json('User not found')
     }
}) 
 
app.put('/image', (req, res) => {
    const { id } = req.body;
    const found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            user.entries++;
            return res.json(user.entries);
        }
    })
    if(!found) {
        return res.status(400).json('not found')
    }

})

app.listen(port, () => {
    console.log(`app is runing on port ${port}`);
});