/*
 * Vue data schema:
 * tasks:[{
 *  id: int,
 *  name: str,
 *  blocked: bool,
 *  done: bool,
 *  dueDate: DateTime,
 * }]
 */

function createTaskObject(id, name, blocked, done, dueDate){
    return {
        id: id,
        name: name,
        blocked: blocked,
        done: done,
        dueDate: dueDate
    }
}

done_task = createTaskObject(1, "Get kitten", false, true, new Date());
blocked_task = createTaskObject(2, "Pass CSC373", true, false, new Date());
task = createTaskObject(3, "Go to cat cafe", false, false, new Date());

const taskComponent = Vue.component('task',{
    props: ['task'],
    template: `
        <div class="row">
                <div class="row">
                    {{task.text}}
                </div>
                <div class="row">
                    <div class="col">
                        {{task.dueDate}}
                    </div>
                    <div class="col">
                        <button class="blocker">
                            Blocker
                        </button>
                    </div>
                    <div class="col">
                        <button class="done">
                            Done
                        </button>
                    </div>
                </div>
        </div>
    `
});

const app = new Vue({
    el: '#app',
    data: {
        tasks:[],
        display:0,
    },
    computed{
        completedTasks: tasks => tasks.filter(task => task['done']),
        blockedTasks: tasks => tasks.filter(task => task['blocked'])
    },
    components:{
        task:taskComponent
    }
});

