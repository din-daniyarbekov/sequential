/*
 * Vue data schema:
 * tasks:[{
 *  id: int,
 *  text: str,
 *  blocked: bool,
 *  done: bool,
 *  dueDate: DateTime,
 * }]
 */
/*
 * Code for creating default data. We would usually load this from server.
 */
function createTaskObject(id, text, blocked, done, dueDate){
    return {
        id: id,
        text: text,
        blocked: blocked,
        done: done,
        dueDate: dueDate
    }
}

done_task = createTaskObject(1, "Get kitten", false, true, new Date());
blocked_task = createTaskObject(2, "Pass CSC373", true, false, new Date());
task = createTaskObject(3, "Go to cat cafe", false, false, new Date());
/*
 * End of server-side interaction code
 */
const taskComponent = Vue.component('task',{
    props: ['task'],
    template: `
        <div class="card container mb-2">
                <div class="card-body">
                    <h5 class="card-title">{{task.text}}</h5>
                    <div class="row">
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
        </div>
    `
});

const app = new Vue({
    el: '#app',
    data: {
        tasks:[done_task, blocked_task, task],
        display:0,
    },
    computed:{
        completedTasks: function(){
            return this.tasks.filter(task => task['done'])
        },
        blockedTasks: function() {
            return this.tasks.filter(task => task['blocked'])
        }
    },
    components:{
        task:taskComponent
    }
});

