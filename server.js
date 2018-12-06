const express = require('express');
const bodyParser = require('body-parser');

const {Mongoose} = require('./server/db/mongoose');
const {User} = require('./server/models/users');
const {Projects} = require('./server/models/projects');
const session = require('express-session')

const _ = require('lodash');

const underscore = require('underscore')

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }))



const api_key = 'key-d49e7e3904329d259b251f94688a45e5';
const domain = 'mg.javednissar.me';
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
 
let data = {
  from: '<postmaster@mg.javednissar.me>',
  to: '',
  subject: '',
  text: ''
};
 



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
                res.send({token:user.tokens[0].token, isAdmin: user.isAdmin});
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


app.post('/admin/invite_user',authenticate,(req,res)=>{
    Projects.find({
        admin: req.user.id}).then((supervisedProjects) =>{
       
        const requiredProject = supervisedProjects.find(function(project){
            return project.name === req.body.projectName;
        })

       user = {
           name: req.body.name,
           email: req.body.email
       }

       requiredProject.projectUsers.push(user);
       requiredProject.save().then((docs) =>{
           res.send(docs);
       },(e) =>{
           console.log(e)
           res.status(400).sendFile(__dirname + "/static/error.html");
       })

    },(e)=>{
        res.status(400).send(e);
    });
})




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

app.post('/admin/add_project',authenticate, (req,res)=>{
   if(req.user.isAdmin){
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
   } else{
        res.redirect('/login');
   }
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

app.get('/admin/get_projects',authenticate,(req,res)=>{
    Projects.find({
        admin: req.user.id
    }).then((projects) =>{
        res.send(projects)
    },(e)=>{
        res.status(400).send(e);
    });
});

app.patch('/admin/update_task',authenticate, (req, res) => {
    Projects.findOneAndUpdate({
        admin:req.user.id,
        name:req.body.projectName,
        "tasks.assignee" : req.body.assigneeEmail
    }, {
        '$set':{
            'tasks.$':{
                "done":req.body.done,
                "blocker":req.body.blocker
            }
        }
    }, function(err, project){
        if(err){
            res.status(500).send("Failure");
        }else{
            res.status(200).send("Success");
        }
    });
});

app.delete('/admin/delete_task', authenticate, (req, res) => {
    Projects.findOneAndUpdate({
        admin:req.user.id,
        name:req.body.projectName
    },{
        '$pull': {
            'tasks': {
                'id':req.body.taskId
            }
        }
    }).then((project) => {
        res.status(200).send("Success");
    }).catch((error) => {
        res.status(500).send("Failure");
    })
})



app.post('/admin/create_task',authenticate, (req, res) =>{
    Projects.findOne({
        admin: req.user.id,
        name: req.body.projectName,
        'projectUsers.email': req.body.email
    }).then((project) => {
        User.findOne({
            email: req.body.email
        }).then((user) => {
            const task = {
                id: parseInt(req.body.taskId),
                text: req.body.text,
                dueDate: new Date(req.body.dueDate),
                priority: parseInt(req.body.priority),
                assignee: user._id,
                assigneeEmail: req.body.email
            }
            project.tasks.push(task);

            project.save().then((docs) => {
                data = {}
                data.to = req.body.email;
                data.subject = 'Sequential: Task Assigned'
                data.text = `You have a new task, ${task.text}`;
                mailgun.messages().send(data, function (error, body) {
                    console.log(body);
                  });
                res.send({docs});
            }, (e) => {
                console.log(e);
                res.status(400).send(e);
            })
        }, (e) => {
            console.log(e);
            res.status(400).send(e);
        })
    }).catch((e) =>{
        console.log(e);
        res.status(400).send(e);
    });
});



app.post('/user/create_task',authenticate, (req, res) =>{
    User.findById(req.user.id).then((user) => {
    Projects.findOne({
        'projectUsers.email': user.email
    }).then((project) => {
        try{
            task = {
                id: parseInt(req.body.taskId),
                text: req.body.text,
                dueDate: new Date(req.body.dueDate),
                priority: parseInt(req.body.priority),
                assignee: user._id
            }
            } catch(e){
                res.status(400).send(e);
            }
            project.tasks.push(task);

            project.save().then((docs) => {
                data.to = req.body.email;
                data.subject = 'Sequential: Task Assigned'
                data.text = `You assigned yourself a new task, ${task.text}`;
                mailgun.messages().send(data, function (error, body) {
                    console.log(body);
                });
                res.send(docs);
            }, (e) => {
                console.log(e);
                res.status(400).send(e);
            })
        }, (e) => {
            console.log(e);
            res.status(400).send(e);
        })
    }).catch((e) =>{
        console.log(e);
        res.status(400).send(e);
    });
});

// app.post('/user/create_task',authenticate, (req, res) =>{
//     Projects.findOne({
//         'users.user._id': req.user.id}).then((project) => {
//             task = {
//                 id: parseInt(req.body.taskId),
//                 text: req.body.text,
//                 dueDate: new Date(req.body.dueDate),
//                 priority: parseInt(req.body.priority),
//                 assignee: req.user.id
//             }
//             project.tasks.push(task);
//             console.log(project);

//         }, (e) => {
//             console.log(e);
//             res.status(400).send(e);
//         })
//     });




    
//
///mg.javednissar.me

//postmaster@mg.javednissar.me


app.get('/user/get_tasks', authenticate, (req, res) => {
    Projects.findOne({
        'tasks.assignee': req.user.id
    }).then((doc) => {
        res.send(doc.tasks);
    }, (e) => {
        res.status(400).sendFile(__dirname + "static/error.html");
    });
});

// app.post('/user_view/create_task', authenticate, (req, res) => {
//    Projects.findOneAndUpdate({
//        'task.assignee': req.user.id
//    },
//    {
//        '$push': {
//            'tasks':{
//                'id':req.body.taskId,
//                'text':req.body.taskText,
//                'dueDate':req.body.taskDueDate,
//                'priority':req.body.taskPriority,
//                'assignee':req.body
//            }
//        }
//    }).then((doc) => {
//        res.send(doc);
//    }, (e) => {
//        console.log(e);
//        res.status(400).sendFile(__dirname + "static/error.html");
//    }) 
// });

app.delete('/user/delete_task', authenticate, (req, res) => {
    User.findById(req.user.id).then((user) => {
        Projects.findOneAndUpdate({
            'projectUsers.email': user.email
        }, {
            '$pull': {
                'tasks': {
                    'id':body.taskId
                }
            }
        }).then((project) => {
            res.status(200).send("Success");
        }).catch((e) =>{
            console.log(e);
            res.status(400).send(e);
        });
    }).catch((e) => {
        res.status(500).send(e);
    });
});

app.patch('/user/update_task', authenticate, (req, res) => {
    User.findById(req.user.id).then((user) => {
        Projects.findOne({
            'projectUsers.email': user.email
        }).then((project) => {
                const done = req.body.done;
                const blocker = req.body.blocker;
                try{
                    project.tasks.forEach(task => {
                        if(task.id == req.body.taskId){
                            task.blocker = blocker;
                            task.done = done;
                        }
                    });
                } catch(e){
                        res.status(400).send(e);
                }


                project.save().then((docs) => {
                    User.findById(project.admin).then((admin) => {
                        data = {}
                        data.to = admin.email;
                        if(done){
                            data.subject = 'Sequential: Task Done';
                            data.text = `The following task is done: ${task.text}`;
                        }else{
                            data.subject = 'Sequential: Task Blocked';
                            data.text = `The following task is blocked: ${task.text}`;
                        }
                        mailgun.messages().send(data, function (error, body) {
                            if(error){
                                res.status(500).send(error);
                            }else{
                                console.log(body);
                            }
                          });
                        res.send(docs); 
                    }).catch((e) => {
                        res.status(500).send(e);
                    });
                }, (e) => {
                    console.log(e);
                    res.status(400).send(e);
                })
            }, (e) => {
                console.log(e);
                res.status(400).send(e);
            });
        }).catch((e) =>{
            console.log(e);
            res.status(400).send(e);
        });
    });




    app.patch('/change_account_details', authenticate, (req, res) => {

            
            User.findById(req.user.id).then((user) => {
                Projects.findOne({
                    'projectUsers.email': user.email
                }).then((project) => {
                   
                    const password = req.body.password;
                    const email = req.body.email;
                    try{
                        project.projectUsers.forEach(projUser => {
                            if(projUser.email == email){
                                projUser.email = email;
                            }
                          });

                    } catch(e){
                            res.status(400).send(e);
                    }
        
        
                        project.save().then((projInfo) => {
                            user.email = email;
                            user.password = password;
                            

                            user.save().then((userInfo) => {
                                res.send(userInfo);
                            }, (e) =>{
                                res.status(500).send(e)
                            })

                            res.send(projInfo)
                            }, (e) =>{
                                res.status(500).send(e);
                            })
                        }, (e) => {
                            console.log(e);
                            res.status(400).send(e);
                        })
                }).catch((e) =>{
                    console.log(e);
                    res.status(400).send(e);
                });
            });





app.listen(3000, ()=>{
    console.log('started on port 3000')
});

