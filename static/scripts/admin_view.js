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
 *      },
 *  }],
 *  users:[{
 *      id: int,
 *      name: str,
 *  }]
 * }]
 */

/*
 * What follows is code for creating the pre-loaded data, this is where we would usually load from the server
 */
function createUserObject(id, name){
    return {
        id:id,
        name:name,
    }
}

const john = createUserObject(1,'John')
const dave = createUserObject(2,'Dave')

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

const done_task = createTaskObject(1, "Get kitten", false, true, 0, new Date(), john);
const blocked_task = createTaskObject(2, "Pass CSC373", true, false, 1, new Date(), dave);
const task = createTaskObject(3, "Go to cat cafe", false, false, 2, new Date(), john);
const done_dog_task = createTaskObject(4, "Get puppy", false, true, 0, new Date(), dave);
const dog_task = createTaskObject(5, "Go to dog cafe", false, false, 2, new Date(), dave);
const tasks = [done_task, blocked_task, task];
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

const project = createProjectObject("Cats", 0, tasks, [john, dave]);
const second_project = createProjectObject("Dogs",0,[done_dog_task, dog_task],[john,dave]);

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
    data: function(){
        return{
            blockedStyle: false,
            doneStyle:false
        }
    },
    computed: {
        listClassObject: function(){
            return {
                'border-secondary': !this.task.done && !this.task.blocked,
                'border-success': this.task.done,
                'border-danger': this.task.blocked
            }
        },
        blockerButtonClassObject:function(){
            return {
                'blocked': this.task.blocked
            }
        },
        doneButtonClassObject:function(){
            return {
                'done': this.task.done
            }
        }
    },
    template: `
        <li class="list-group-item mt-1 border" v-bind:class="listClassObject">
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
                            <div class="btn-group btn-group-sm" role="group" aria-label="Status Buttons" >
                                <button v-on:click="blockerMethod" class="btn btn-outline-dark" v-bind:class="blockerButtonClassObject">
                                    Blocker
                                </button>
                                <button v-on:click="doneMethod" v-bind:class="doneButtonClassObject" class="btn btn-outline-dark">
                                    Done
                                </button>
                                <button class="btn btn-outline-dark" v-on:click="deleteMethod">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col text-center">
                    <span>{{task.assignee.name}}</span>
                    <span v-show="task.priority == 1" class="badge badge-warning">IMPORTANT</span>
                    <span v-show="task.priority == 2" class="badge badge-danger">URGENT</span>
                </div>
            </div>
        </li>
    `,
    methods:{
        blockerMethod: function(event){
            this.task.blocked = !this.task.blocked;
            if(this.task.blocked){
                this.task.done = false;
                this.project.completedTasks = this.project.completedTasks.filter(makeTaskFilter(this.task));
                this.project.blockedTasks.push(this.task);
            }else{
                this.project.blockedTasks = this.project.blockedTasks.filter(makeTaskFilter(this.task));
            }
        },
        doneMethod: function(event){
            this.task.done = !this.task.done;
            if(this.task.done){
                this.task.blocked =false;
                this.project.blockedTasks = this.project.blockedTasks.filter(makeTaskFilter(this.task));
                this.project.completedTasks.push(this.task);
            }else{
                this.project.completedTasks = this.project.completedTasks.filter(makeTaskFilter(this.task));
            }
        },
        deleteMethod: function(event){
            this.project.tasks = this.project.tasks.filter(this.taskFilter);
            this.project.blockedTasks = this.project.blockedTasks.filter(makeTaskFilter(this.task));
            this.project.completedTasks = this.project.completedTasks.filter(makeTaskFilter(this.task));
        }
    }
});

const app = new Vue({
    el: '#app',
    data: {
        projects:[project,second_project]
    },
    components:{
        task: taskComponent
    }
});



