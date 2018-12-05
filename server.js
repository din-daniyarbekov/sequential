const express = require('express');
const bodyParser = require('body-parser');

const {Mongoose} = require('./server/db/mongoose');
const {User} = require('./server/models/users');
const {Projects} = require('./server/models/projects');
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

// serve the static files
app.use(express.static('static'))

app.use(session({
	secret: 'oursecret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		expires: 600000,
		httpOnly: true
	}
}))


app.get('/',(req,res)=>{
    res.redirect('./login');
})

app.route('/registration')
  .get((req, res) => {
    res.sendFile(__dirname + '/static/account-creation.html')
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


let authenticate = (req, res, next) => {
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



app.delete('/users/logout',authenticate,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    });
})


app.post('/registration',(req,res)=>{
    let body = _.pick(req.body, ['name','email','password','isAdmin']);
    let user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
      }).then((token) => {
        res.header('x-auth', token).send(user);
      }).catch((e) => {
        
        res.status(400).send(e);
      })
});





// app.post('/add_task',authenticate, (req,res)=>{
//   let task  = new tasks({
//       description: req.body.description,
//       id: req.body.id,
//       blocker: req.body.blocker,
//       dueDate: req.body.date,
//       _creator: req.user.id
//   });

//   task.save().then((docs)=>{
//     res.send(docs)
//   }, (e) =>{
//     res.send(e);
//   });
// });

app.post('/add_project',authenticate, (req,res)=>{
    let project  = new Projects({
        name: req.body.name,
        admin: req.user.id
    });
  
    project.save().then((docs)=>{
      res.send(docs)
    }, (e) =>{
        console.log(e);
        res.status(400).sendFile(__dirname + "/static/error.html");
    });
  });
  
// app.patch('/block_task/:id',authenticate, (req,res)=>{
//     let ID = req.params.id;
//     let body = _.pick(req.body,['blocker']);

//     let bodyBlocker = (body.blocker == 'true');

//     tasks.findOneAndUpdate({id: ID,
//     _creator: req.user.id}, {$set:{blocker: bodyBlocker}}).then((doc)=>{
//         res.send(doc);
//     }).catch((e) =>{
//         res.status(400).send(e)
//     });
    
// });

// app.patch('/done_task/:id',authenticate, (req,res)=>{
//     let ID = req.params.id;
//     let body = _.pick(req.body,['done']);

//     let bodyDone = (body.done == 'true');

//     tasks.findOneAndUpdate({id: ID,
//         _creator: req.user.id}, {$set:{done: bodyDone}}).then((doc)=>{
//         res.send(doc);
//     }).catch((e) =>{
//         res.status(400).send(e)
//     });
    
// });


// app.delete('/delete_task/:id',authenticate,(req,res)=>{
//     let ID = req.params.id;

//     tasks.findOne({
//         id: ID,
//         _creator: req.user.id
//     }).then((docs)=>{
//         if(!docs){
//             return res.status(404).send();
//         }
        
//         if(docs.length > 0){
//             docs.forEach(doc => doc.remove());
//         }
//         return res.status(200).send();
//     })
// })


// app.get('/get_tasks',authenticate,(req,res)=>{
//     tasks.find({
//         _creator: req.user.id
//     }).then((docs) =>{
//         res.send({docs})
//     },(e)=>{
//         res.status(400).send(e);
//     })
// })

app.get('/get_projects',authenticate,(req,res)=>{
    Projects.find({
        admin: req.user.id
    }).then((docs) =>{
        res.send({docs})
    },(e)=>{
        res.status(400).send(e);
    });
});

app.post('/create_task/admin',authenticate, (req, res) =>{
    Projects.findOne({
        admin: req.user.id,
        name: req.body.projectName
    }).then((project) => {
        User.findOne({
            email: req.body.assigneeEmail
        }).then((user) => {
            task = {
                id: parseInt(req.body.taskId),
                text: req.body.text,
                dueDate: new Date(req.body.dueDate),
                priority: parseInt(req.body.priority),
                assignee: user._id
            }
            project.tasks.push(task);
            project.save().then((docs) => {
                res.send({docs});
            }, (e) => {
                res.status(400).send(e);
            })
        }, (e) => {
            console.log(e);
            res.status(400).send(e);
        })
    }, (e) => {
        console.log(e);
        res.status(400).send(e);
    });
});

app.get('/get_tasks', authenticate, (req, res) => {
    Projects.findOne({
        'tasks.assignee': req.user.id
    }).then((doc) => {
        res.send({doc});
    }, (e) => {
        res.status(400).sendFile(__dirname + "static/error.html");
    });
});

app.post('/create_task', authenticate, (req, res) => {
   Projects.findOneAndUpdate({
       'task.assignee': req.user.id
   },
   {
       '$push': {
           'tasks':{
               'id':req.body.taskId,
               'text':req.body.taskText,
               'dueDate':req.body.taskDueDate,
               'priority':req.body.taskPriority,
               'assignee':req.body
           }
       }
   }).then((doc) => {
       res.send('Success');
   }, (e) => {
       console.log(e);
       res.status(400).sendFile(__dirname + "static/error.html");
   }) 
});

app.patch('/update_task', authenticate, (req, res) => {
    Projects.findOneAndUpdate({
        'task.assignee': req.user.id
    })
})

app.listen(3000, ()=>{
    console.log('started on port 3000')
});

