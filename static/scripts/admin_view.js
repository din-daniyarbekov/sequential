/*
 * Vue data schema:
 * projects : [{
 *  name:str,
 *  display: int,
 *  completedTasks:[{
 *      id: int,
 *      text: str,
 *      priority: int,
 *      blocker: bool,
 *      done: bool,
 *      dueDate: DateTime,
 *      assignee: {
 *          id: int,
 *          name: str,
 *          email:str
 *      },
 *  }],
 *  tasks:[{
 *      id: int,
 *      text: str,
 *      priority: int,
 *      blocker: bool,
 *      done: bool,
 *      dueDate: DateTime,
 *      assignee: {
 *          id: int,
 *          name: str,
 *          email: str
 *      },
 *  }],
 *  blockedTasks:[{
 *      id: int,
 *      text: str,
 *      blocked: bool,
 *      done: bool,
 *      dueDate: DateTime,
 *      assignee: {
 *          id: int,
 *          name: str,
 *          email: str
 *      },
 *  }],
 *  users:[{
 *      id: int,
 *      name: str,
 *      email: str
 *  }]
 * }]
 */

/*
 * What follows is code for creating the pre-loaded data, this is where we would usually load from the server
 */
function createUserObject(id, name, email){
    return {
        id:id,
        name:name,
        email:email
    }
}


function createTaskObject(id, text, blocked, done, priority, dueDate, assignee){
    return {
        id: id,
        text: text,
        priority: priority,
        blocked: blocked,
        done: done,
        dueDate: dueDate,
        assignee: assignee
    }
}


/*
End of where we would normally include server-side interaction
 */

function createProjectObject(name, display, tasks, users){
    const completedTasks = tasks.filter(task => task['done'])
    const blockedTasks = tasks.filter(task => task['blocked'])
    return {
        name: name,
        display: display,
        completedTasks: completedTasks,
        tasks:tasks,
        blockedTasks:blockedTasks,
        users:users,
        seen:false,
        create:false
    }
}


function makeTaskFilter(taskToFilterBy){
    return (taskToFilter) => taskToFilter.id != taskToFilterBy.id;
}



/*when users press the "blocker" button, the data about this task being a blocker sent to the server and then the 
admin who is overseeing the projects will be notified. Similar to done, after pressing done, the admin should be notified as well
When the task deadline is expired, tasks that havent been done will change status to blocker and admins will be notified*/


/*when users press the "Create New Project" the project information will popup and after filling it and hitting submit button
the data will be sent to the server to add the empty project to the admins list*/
const taskComponent = Vue.component('task',{
    props: ['task','project'],
    computed: {
        relativeTime:function(){
            return relativeTimeOfTask(this.task);
        }
    },
    template: `
        <li class="list-group-item mt-1 border" >
            <div class="row">
                <div class="col-8">
                    <div class="row h-50 ml-1">
                        {{task.text}}
                    </div>
                    <div class="row mt-2">
                        <div class="mr-2">
                            {{task.dueDate.toLocaleDateString()}}
                        </div>
                        <div>
                            <div class="btn-group btn-group-sm mb-2" role="group" aria-label="Status Buttons" >
                                <button class="btn btn-outline-dark" v-on:click="deleteMethod">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col text-center">
                    <div> <span>{{task.assignee.name}}</span></div>
                    <span v-show="task.priority == 1" class="badge badge-warning">IMPORTANT</span>
                    <span v-show="task.priority == 2" class="badge badge-danger">URGENT</span>
                    <span v-show="relativeTime == 0" class="badge badge-danger">OVERDUE</span>
                    <span v-show="relativeTime == 1" class="badge badge-warning">TODAY</span>
                    <span v-show="relativeTime == 2" class="badge badge-primary">WITHIN 7 DAYS</span>
                    <span v-show="relativeTime == 3" class="badge badge-info">WITHIN 30 DAYS</span>
                    <span v-show="relativeTime == 4" class="badge badge-secondary">MORE THAN 30 DAYS</span>
                </div>
            </div>
        </li>
    `,
    methods:{
        deleteMethod: function(event){
            requestData = {
                projectName: this.project.name,
                taskId: this.task.id
            }
            const taskDeleteRequest = new Request('/admin/delete_task', {
                method: 'delete',
                body: JSON.stringify(requestData),
                headers: constantHeaders
            })
            fetch(taskDeleteRequest).then((response) => {
                if(response.status === 200){
                    this.project.tasks = this.project.tasks.filter(makeTaskFilter(this.task));
                    this.project.blockedTasks = this.project.blockedTasks.filter(makeTaskFilter(this.task));
                    this.project.completedTasks = this.project.completedTasks.filter(makeTaskFilter(this.task));
                    return response.json();
                }else{
                    throw new Error(response.blob());
                }
            }).catch((error) => {
                alert("Task Delete Failed");
                console.log(error);
            });
        }
    }
});

const validateEmail = (email) => {
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;

    return expression.test(String(email).toLowerCase())
}


const foundUserFunction = function(emailToFind){
    return function(user){
        return user.email === emailToFind;
    }
}




const request = new Request('admin/get_projects', {
    method: 'get', 
    headers: constantHeaders
});

fetch(request).then(function(res){
    if (res.status === 200) {
        return res.json();
    } else {
        window.alert('Error, incorrect log in information');
        throw new Error(res.json());
    }
}).then(function(json){
    let projects = [];
    for(const json_project of json){
        const json_tasks = json_project.tasks;
        const json_users = json_project.projectUsers;
        tasks = [];
        users = [];
        let userCount = 0;
        for(const json_user of json_users){
            const user = createUserObject(userCount, json_user.name, json_user.email);
            users.push(user);
            userCount++;
        }
        function makeFindUserFunc(userEmail){
            return (user) => {
                return user.email === userEmail;
            }
        }
        for(const json_task of json_tasks){
            findUserFunc = makeFindUserFunc(json_task.assigneeEmail);
            task = createTaskObject(json_task.id, 
                json_task.text, 
                json_task.blocker, 
                json_task.done, 
                json_task.priority, 
                new Date(json_task.dueDate), 
                users.find(findUserFunc));
            tasks.push(task);
        }
        projects.push(createProjectObject(json_project.name,0,tasks, users));
    }

    const app = new Vue({
        el: '#app',
        data: {
            projects:projects,
            inviteUserEmail:"",
            newTaskText:"",
            newTaskUserEmail:"",
            newTaskPriority:0,
            newDueDate:new Date(),
            inviteUserName:"",
            search:"",
            newProjectText:"",
        },
        components:{
            task: taskComponent
        },
        methods:{
            removeWhitespace: function(text){
                return text.split(' ').join('');
            },
            inviteUser:function(project){
                const foundUser = project.users.find(foundUserFunction(this.inviteUserEmail));
                if(this.inviteUserName){
                    if(validateEmail(this.inviteUserEmail) && foundUser === undefined){
                        let newUserId = 1;
                        if(project.users.length > 0){
                            newUserId = incrementMaxId(project.users);
                        }
                        const inviteUserRequest = new Request("/admin/invite_user",{
                            method:"post",
                            body: JSON.stringify({
                                name: this.inviteUserName,
                                email: this.inviteUserEmail,
                                projectName: project.name
                            }),
                            headers: constantHeaders
                        });
                        const inviteUserEmail = this.inviteUserEmail;
                        const inviteUserName = this.inviteUserName;
                        fetch(inviteUserRequest).then(function(response){
                            if(response.status === 200){
                                alert("New user invited!");
                                const newUser = createUserObject(newUserId, inviteUserName, inviteUserEmail);
                                project.users.push(newUser);
                            }else{
                                alert("User invite failed!");
                            }
                        }).catch(function(error){
                            console.log(error);
                        });
                    }else if(!validateEmail(this.inviteUserEmail)){
                        alert('Email is invalid');
                    }else{
                        alert('Duplicate user found');
                    }        
                } else {
                    alert('The user name cannot be null');
                }
            },
    
            createTask: function(project){
    
                // assume tasks are due at 11:59 pm on their due date
    
                current = new Date()
                dueDate = new Date(this.newDueDate);
                dueDate.setDate(dueDate.getDate()+1);
    
                if(current <= dueDate){
                    if(this.newTaskText){
                        if(this.newTaskUserEmail){
                            let newId = 1;
                            if(project.tasks.length > 0){
                                newId = incrementMaxId(project.tasks);
                            }   
                            const foundUser = project.users.find(foundUserFunction(this.newTaskUserEmail));
                            const createTaskRequest = new Request("/admin/create_task",{
                                method: 'post',
                                body: JSON.stringify({
                                    projectName:project.name,
                                    email:this.newTaskUserEmail,
                                    text: this.newTaskText,
                                    taskId:newId,
                                    dueDate: dueDate,
                                    priority: this.newTaskPriority
                                }),
                                headers: constantHeaders
                            });
                            const taskText = this.newTaskText;
                            const taskPriority = this.newTaskPriority;
                            const taskDueDate = this.newDueDate;
                            const taskUserEmail = this.newTaskUserEmail;
                            fetch(createTaskRequest).then(function(response){
                                if(response.status === 200){
                                    alert(`New Task Made With:(Name:${taskText},Due Date:${taskDueDate.toString()},Assignee:${taskUserEmail}),Priority:${taskPriority}`);
                                    const task = createTaskObject(newId, taskText, false, false, taskPriority, dueDate, foundUser);
                                    project.tasks.push(task); 
                                }else if(response.status === 404){
                                    alert("Your assignee hasn't registered!");
                                }else{
                                    alert("No Task Made");
                                }
                            }).catch(function(err){
                                console.log(err);
                            });
                        }else{
                            alert('A person must be assigned to a new task!');
                        }
                    }else{
                        alert('Task name cannot be null');
                    }
                }else{
                    alert('Assigned due date cannot have already passed');
                }
            },
    
            createProject:function(){
                function makeFindProjectFunc(projectName){
                    return (project) => {
                        project.name === projectName;
                    }
                }
                if (this.newProjectText && this.projects.find(makeFindProjectFunc(this.newProjectText)) === undefined){
                    const createProjectRequest = new Request('/admin/add_project', {
                        method: 'post',
                        body:JSON.stringify({"name":this.newProjectText}), 
                        headers: constantHeaders
                    });
                    let projectName = this.newProjectText;
                    projects = this.projects;
                    fetch(createProjectRequest).then(function(response){
                        if(response.status === 200){
                            alert(`New Project called: ${projectName} created`);
                            const newProject = createProjectObject(projectName, 0, [], []);
                            projects.push(newProject);
                        }else{
                            alert("Create Project Failed");
                        }
                    }).catch(function(error){
                        console.log(error);
                        alert("Create Project Failed");
                    });
                }else{
                    alert('Project name cannot be null')
                }
            },
    
            searchAndSortTaskList: function(taskList){
                const search_func = function(search_str){
                    return function(task){
                        return task.text.toLowerCase().includes(search_str.toLowerCase());
                    }
                }
                
                if(this.search === ""){
                    return taskList.slice(0).sort(sort_task_func);
                }else{
                    return taskList.filter(search_func(this.search)).sort(sort_task_func);
                }         
            }
        }
    });
}).catch((e) => {
    console.log(e);
    alert("An error occurred!");
})
