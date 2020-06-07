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
const domain = '-----';
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
 
let data = {
  from: '<postmaster@mg.javednissar.me>',
  to: '',
  subject: '',
  text: ''
};
 

app.use(express.static('static'))
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
        let userToUse = null;
        User.findByEmailPassword(email, password).then((user) => {
            userToUse = user;
            return user.generateAuthToken();
        }).then((token) => {
            res.send({token:token, isAdmin: userToUse.isAdmin});
        }).catch((error) => {
            res.status(400).send(error);
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
          res.status(401).end();
        });
      };



app.delete('/users/logout',authenticate,(req,res)=>{
    req.user.deleteToken(req.token).then(()=>{
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
      }).then((result) => {
        res.header('x-auth', result.token).send(user);
      }).catch((e) => {
        
        res.status(400).send(e);
      })
});

function makeInviteURL(){
    if(process.env.PORT){
        return "https://polar-ocean-74397.herokuapp.com/account-creation.html";
    }
    return "localhost:3000/index.html";
}

app.post('/admin/invite_user',authenticate,(req,res)=>{
    Projects.find({
        admin: req.user.id,
    name: req.body.projectName}).then((requiredProjects) =>{

    var requiredProject; 
    try{
        requiredProject = requiredProjects[0];

    } catch(e){
        return res.status(500).send(e)
    }
    

    user = {
        name: req.body.name,
        email: req.body.email
    }

    const duplicateUser = requiredProject.projectUsers.find((projUser)=>{
        return projUser.email === user.email;
    })

    if(!duplicateUser){
        requiredProject.projectUsers.push(user);
    } else{

    }
    requiredProject.save().then((docs) =>{
        data.to = req.body.email;
        data.subject = `Sequential: You're invited to ${req.body.projectName}`;
        const inviteURL = makeInviteURL();
        data.text = `Please go to ${inviteURL}`;
        // mailgun.messages().send(data, function (error, body) {
        //     console.log(body);
        // });  

        res.send(docs);
    },(e) =>{
        console.log(e)
        res.status(400).sendFile(__dirname + "/static/error.html");
    })

    },(e)=>{
        res.status(400).send(e);
    });
})




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
  


app.get('/admin/get_projects',authenticate,(req,res)=>{
    Projects.find({
        admin: req.user.id
    }).then((projects) =>{
        res.send(projects)
    },(e)=>{
        res.status(400).send(e);
    });
});






app.post('/admin/create_task',authenticate, (req, res) =>{
    Projects.findOne({
        admin: req.user.id,
        name: req.body.projectName,
        'projectUsers.email': req.body.email
    }).then((project) => {
        User.findOne({
            email: req.body.email
        }).then((user) => {
            console.log(user);
            if(user === undefined){
                res.status(404).send("Could not find user");
                return;
            }
            try{
                let task = {
                    id: parseInt(req.body.taskId),
                    text: req.body.text,
                    dueDate: new Date(req.body.dueDate),
                    priority: parseInt(req.body.priority),
                    assignee: user._id,
                    assigneeEmail: req.body.email
                }
                project.tasks.push(task);
                project.save().then((docs) => {
                    data.to = task.assigneeEmail;
                    data.subject = 'Sequential: Task Assigned'
                    data.text = `You have a new task, ${req.body.text}`;
                    // mailgun.messages().send(data, function (error, body) {
                    //     console.log("Task Email Sent");
                    // }, (e)=>{
                    //     console.log(e);
                    // });
                    res.send(docs);
                }, (e) => {
                    console.log(e);
                    res.status(400).send(e);
                });
            } catch(e){
                return res.status(400).send(e);
            }
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
                assignee: user._id,
                assigneeEmail: user.email
            }
            console.log(user);
            console.log(project)
           
            project.tasks.push(task);

            project.save().then((docs) => {

                User.findById(project.admin).then((admin) => {
                    data.to = admin.email;

                    data.subject = 'Sequential: Task Created';
                    data.text = `The following task is created: ${task.text}`;
                    // mailgun.messages().send(data, function (error, body) {
                    //     if(error){
                    //         res.status(500).send(error);
                    //     }else{
                    //         console.log(body);
                    //     }});
                    res.send(docs); 
                })
            }, (e) => {
                console.log(e);
                res.status(400).send(e);
            })
        } catch(e){
            res.status(400).send(e);
        }
        }, (e) => {
            console.log(e);
            res.status(400).send(e);
        })
    }).catch((e) =>{
        console.log(e);
        res.status(400).send(e);
    });
});


    


app.get('/user/get_tasks', authenticate, (req, res) => {
    console.log(req.user);
    Projects.findOne({
        'tasks.assignee': req.user.id
    }).then((doc) => {
        res.send(doc.tasks);
    }, (e) => {
        res.status(400).sendFile(__dirname + "static/error.html");
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
                    const taskIndex = project.tasks.findIndex(task =>{
                        return task.id === req.body.taskId;
                    });
                    project.tasks[taskIndex].blocker = blocker;
                    project.tasks[taskIndex].done = done;
                    const task = project.tasks[taskIndex];

                project.save().then((docs) => {
                    User.findById(project.admin).then((admin) => {
                        data.to = admin.email;
                        if(done){
                            data.subject = 'Sequential: Task Done';
                            data.text = `The following task is done: ${task.text}`;
                        }else if(blocker){
                            data.subject = 'Sequential: Task Blocked';
                            data.text = `The following task is blocked: ${task.text}`;
                        }else{
                            data.subject = 'Sequential: Task is no longer Done or Blocked';
                            data.text = `The following task is no longer done or blocked: ${task.text}`;
                        }
                        // mailgun.messages().send(data, function (error, body) {
                        //     if(error){
                        //         res.status(500).send(error);
                        //     }else{
                        //         console.log(body);
                        //     }
                        //   });
                        res.send(docs); 
                    });
                } , (e) => {
                    console.log("error",e);
                    res.status(400).send(e);
                })
            }catch(e){
                    console.log("error",e);
                    return res.status(400).send(e);
            } 
            }, (e) => {
                console.log(e);
                res.status(400).send(e);
            });
        }).catch((e) =>{
            console.log(e);
            res.status(400).send(e);
        });
    });


    app.delete('/admin/delete_task', authenticate, (req, res) => {
        User.findById(req.user.id).then((admin) => {
            Projects.findOne({
                admin: admin._id,
                name: req.body.projectName
            }).then((project) => {
                    
                    console.log(project);
                    const filteredTasks = project.tasks.filter((task)=>{
                        return task.id != req.body.taskId;
                    })

                    const deletedTask = project.tasks.find((task)=>{
                        return task.id == req.body.taskId;
                    })

                    project.tasks = filteredTasks;
                    project.save().then((docs) => {

                    data.to = deletedTask.assigneeEmail;
                    data.subject = 'Sequential: Task Deleted'
                    data.text = `Deleted the task: ${deletedTask.text} in ${project.name}`;
                    // mailgun.messages().send(data, function (error, body) {
                    // console.log(body);
                    // },(e)=>{
                    //     console.log(e);
                    // });  

                        res.status(200).send(docs); 
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

    



    app.patch('/change_account_details', authenticate, (req, res) => {            
            User.findById(req.user.id).then((user) => {

                if(user.isAdmin){
                    try{
                        user.password = req.body.password;
                        user.email = req.body.email;
                    } catch(e){
                        return res.status(400).send(e)
                    }
                    
                    user.save().then(user =>{
                        req.user.deleteToken(req.token).then(()=>{
                            res.status(200).send();
                        },()=>{
                            res.status(400).send();
                        });

                        return res.status(200).send();
                    },(e) =>{
                        return res.status(400).send(e);
                    })
                }
                else{
                Projects.findOne({
                    'projectUsers.email': user.email
                }).then((project) => {
                   
                    const password = req.body.password;
                    const email = req.body.email;

                    // console.log(project);
                    try{
                        project.projectUsers.forEach(projUser => {
                            if(projUser.email == user.email){
                                projUser.email = email;
                            }
                          });

                        project.tasks.forEach(task => {
                            if(task.assigneeEmail === user.email){
                                task.assigneeEmail = email;
                            }
                        });

        
                        project.save().then((projInfo) => {
                            user.email = email;
                            user.password = password;
                            

                            user.save().then((userInfo) => {
                                
                                req.user.deleteToken(req.token).then(()=>{
                                    res.status(200).send();
                                },()=>{
                                    res.status(400).send();
                                });

                                return res.send();
                            }, (e) =>{
                                return res.status(500).send(e)
                            })

                            return res.send(projInfo)
                            }, (e) =>{
                                return res.status(500).send(e);
                            })

                        } catch(e){
                            return res.status(400).send(e);
                        }
                    }, (e) => {
                            console.log(e);
                            return res.status(400).send(e);
                        })
                    }
                }).catch((e) =>{
                    console.log(e);
                    return res.status(400).send(e);
                });
            });




if(process.env.PORT){
    app.listen(process.env.PORT, ()=> {
        console.log(`Started on ${process.env.PORT}`);
    });
}else{
    app.listen(3000, ()=>{
        console.log('started on port 3000');
    });
}

