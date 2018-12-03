const express = require('express');
const bodyParser = require('body-parser');

const {Mongoose} = require('./server/db/mongoose');
const {User} = require('./server/models/users')
const {tasks} = require('./server/models/tasks')
const {Projects} = require('./server/models/projects')
const session = require('express-session')

const _ = require('lodash');

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }))


/*auth -> we send the token from the server to the client (id),
    data = {
        id: 3
    }
    helps us understand which user made the request. for the security reasons we will use the token system
    token  = {
        data,
        hash -> hashed value of the data
    }
*/


app.use(session({
	secret: 'oursecret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		expires: 600000,
		httpOnly: true
	}
}))

const sessionChecker = (req, res, next) => {
	if (req.session.user) {
        if(req.session.user.userType == 'admin'){
            res.redirect('admin_view');
        }
        else{
            res.redirect('user_view');
        }
	} else {
		next();
	}
}

app.get('/',sessionChecker,(req,res)=>{
    res.redirect('./login');
})


app.get('/admin_view', (req, res) => {
	// check if we have active session cookie
    
    //need to render the view using vue ssr
    // if (req.session.user) {
	// 	//res.sendFile(__dirname + '/public/dashboard.html')
		
	// } else {
		res.redirect('/login')
})

app.get('/user_view', (req, res) => {
	// check if we have active session cookie
    
    //need to render the view using vue ssr
    // if (req.session.user) {
	// 	//res.sendFile(__dirname + '/public/dashboard.html')
		
	// } else {
		res.redirect('/login')
})


app.route('/login')
	.get((req, res) => {
		res.sendFile(__dirname + '/static/index.html')
    })


app.post('/users/login', (req, res) => {
        const email = req.body.email
        const password = req.body.password
    
        User.findByEmailPassword(email, password).then((user) => {
                res.send(user);
        }).catch((error) => {
            res.status(400).send()
        })
    })





var authenticate = (req, res, next) => {
        var token = req.header('x-auth');
      
        User.findByToken(token).then((user) => {
          if (!user) {
            return Promise.reject();
          }
      
          req.user = user;
          req.token = token;
          next();
        }).catch((e) => {
          res.status(401).send();
        });
      };

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
  });


app.delete('/users/logout',authenticate,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    });
})


app.post('/users/registration',(req,res)=>{
    let body = _.pick(req.body, ['name','email','password']);
    let user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
      }).then((token) => {
        res.header('x-auth', token).send(user);
      }).catch((e) => {
        res.status(400).send(e);
      })
});





app.post('/add_task',authenticate, (req,res)=>{
  let task  = new tasks({
      description: req.body.description,
      id: req.body.id,
      blocker: req.body.blocker,
      dueDate: req.body.date,
      _creator: req.user.id
  });

  task.save().then((docs)=>{
    res.send(docs)
  }, (e) =>{
    res.send(e);
  });
});

app.patch('/block_task/:id', (req,res)=>{
    let ID = req.params.id;
    let body = _.pick(req.body,['blocker']);

    let bodyBlocker = (body.blocker == 'true');

    tasks.findOneAndUpdate({id: ID}, {$set:{blocker: bodyBlocker}}).then((doc)=>{
        res.send(doc);
    }).catch((e) =>{
        res.status(400).send(e)
    });
    
});

app.patch('/done_task/:id', (req,res)=>{
    let ID = req.params.id;
    let body = _.pick(req.body,['done']);

    let bodyDone = (body.done == 'true');

    tasks.findOneAndUpdate({id: ID}, {$set:{done: bodyDone}}).then((doc)=>{
        res.send(doc);
    }).catch((e) =>{
        res.status(400).send(e)
    });
    
});


app.delete('/delete_task/:id',(req,res)=>{
    let ID = req.params.id;

    tasks.find({id: ID}).then((docs)=>{
        if(!docs){
            return res.status(404).send();
        }
        
        if(docs.length > 0){
            docs.forEach(doc => doc.remove());
        }
        return res.status(200).send();
    })
})


app.get('/get_tasks',authenticate,(req,res)=>{
    tasks.find({
        _creator: req.user.id
    }).then((docs) =>{
        res.send({docs})
    },(e)=>{
        res.status(400).send(e);
    })
})



app.listen(3000, ()=>{
    console.log('started on port 3000')
});

