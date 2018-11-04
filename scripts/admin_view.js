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

john = createUserObject(1,'John', 'images/default.png')
dave = createUserObject(2,'Dave', 'images/default.png')

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

done_task = createTaskObject(1, "Get kitten", false, true, new Date(), john);
blocked_task = createTaskObject(2, "Pass CSC373", true, false, new Date(), dave);
task = createTaskObject(3, "Go to cat cafe", false, false, new Date(), john);
tasks = [done_task, blocked_task, task];

function createProjectObject(name, display, tasks, users){
    completedTasks = tasks.filter(task => task['done'])
    blockedTasks = tasks.filter(task => task['blocked'])
    return {
        name: name,
        display: display,
        completedTasks: completedTasks,
        tasks:tasks,
        blockedTasks:blockedTasks,
        users:users
    }
}

project = createProjectObject("Cats", 0, tasks, [john, dave]);

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
        projects:[project]
    },
    components:{
        task: taskComponent
    }
});



