/*
 * Vue data schema:
 * projects : [{
 *  name:str,
 *  display: int,
 *  completedTasks:[{
 *      id: int,
 *      text: str,
 *      blocker: bool,
 *      done: bool,
 *      dueDate: DateTime,
 *      assignee: {
 *          id: int,
 *          name: str,
 *          picture: str
 *      },
 *  }],
 *  tasks:[{
 *      id: int,
 *      text: str,
 *      blocker: bool,
 *      done: bool,
 *      dueDate: DateTime,
 *      assignee: {
 *          id: int,
 *          name: str,
 *          picture: str
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
 *          picture: str
 *      },
 *  }],
 *  users:[{
 *      id: int,
 *      name: str,
 *      picture: str
 *  }]
 * }]
 */

/*
 * What follows is code for creating the pre-loaded data, this is where we would usually load from the server
 */
function createUserObject(id, name, picture){
    return {
        id:id,
        name:name,
        picture:picture
    }
}

const john = createUserObject(1,'John', 'images/default.png')
const dave = createUserObject(2,'Dave', 'images/default.png')

function createTaskObject(id, text, blocked, done, dueDate, assignee){
    return {
        id: id,
        text: text,
        blocked: blocked,
        done: done,
        dueDate: dueDate,
        assignee: assignee
    }
}

const done_task = createTaskObject(1, "Get kitten", false, true, new Date(), john);
const blocked_task = createTaskObject(2, "Pass CSC373", true, false, new Date(), dave);
const task = createTaskObject(3, "Go to cat cafe", false, false, new Date(), john);
const done_dog_task = createTaskObject(4, "Get puppy", false, true, new Date(), dave);
const dog_task = createTaskObject(5, "Go to dog cafe", false, false, new Date(), dave);
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

const taskComponent = Vue.component('task',{
    props: ['task'],
    template: `
        <div class="row">
            <div class="col-8">
                <div class="row h-75 ml-1">
                    {{task.text}}
                </div>
                <div class="row align-items-end">
                    <div class="col">
                        {{task.dueDate.toLocaleDateString()}}
                    </div>
                    <div class="col">
                        <button class="blocker btn btn-danger btn-sm">
                            Blocker
                        </button>
                    </div>
                    <div class="col">
                        <button class="done btn btn-success btn-sm">
                            Done
                        </button>
                    </div>
                </div>
            </div>
            <div class="col text-center">
                <img :src="task.assignee.picture"/>
                <span>{{task.assignee.name}}</span>
            </div>
        </div>
    `
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



