/*
 * Vue data schema:
 * tasks:[{
 *  id: int,
 *  text: str,
 *  blocked: bool,
 *  done: bool,
 *  priority:int,
 *  dueDate: DateTime,
 * }]
 */
/*
 * Code for creating default data. We would usually load this from server.
 */
function createUserObject(id, name){
	return {
		id:id,
		name:name,
	}
}

const john = createUserObject(1,'John')


function createTaskObject(id, text, blocked, done, priority, dueDate){
	return {
		id: id,
		text: text,
        priority:priority,
		blocked: blocked,
		done: done,
		dueDate: dueDate	}
}

const done_task = createTaskObject(1, "Get kitten", false, true, 0, yesterday, john);
const blocked_task = createTaskObject(2, "Pass CSC373", true, false, 1, today, john);
const task = createTaskObject(3, "Go to cat cafe", false, false, 2, withinNextWeek, john);
const tasks = [done_task, blocked_task, task];

/*
 * End of server-side interaction code
 */
const taskComponent = Vue.component('task',{
	props: ['task'],
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
		},
		relativeTime: function(){
			return relativeTimeOfTask(this.task);
		}
	},
	template: `
		<div class="container card centered-auto-margin w-50 mt-1" v-bind:class="listClassObject">

        			<div class="card-body">

        				<div class="row h-50 ml-8">
        					{{task.text}}
                            <div class="col text-right">
                                <span v-show="task.priority == 1" class="badge badge-warning">IMPORTANT</span>
								<span v-show="task.priority == 2" class="badge badge-danger">URGENT</span>
								<span v-show="relativeTime == 0" class="badge badge-danger">OVERDUE</span>
								<span v-show="relativeTime == 1" class="badge badge-warning">TODAY</span>
								<span v-show="relativeTime == 2" class="badge badge-primary">NEXT 7 DAYS</span>
								<span v-show="relativeTime == 3" class="badge badge-info">NEXT 30 DAYS</span>
								<span v-show="relativeTime == 4" class="badge badge-secondary">FUTURE</span>
                            </div>
        				</div>

        				<div class="row mt-2">
        					<div class="mr-2">
        						{{task.dueDate.toLocaleDateString()}}
        					</div>
        					<div class="btn-group btn-group-sm" role="group" aria-label="Status Buttons">

        					   <button v-on:click="blockerMethod" class="btn btn-outline-dark" v-bind:class="blockerButtonClassObject">
        								Blocker
        						</button>
        			 
        						<button v-on:click="doneMethod" v-bind:class="doneButtonClassObject" class="btn btn-outline-dark">
        							Done
        						</button>
        					</div>
        				

                         </div>
        			</div>
		</div>
	`,
	methods:{
		blockerMethod: function(event){
			this.task.blocked = !this.task.blocked;
			if(this.task.blocked){
				this.task.done = false;
				/*this.project.completedTasks = this.project.completedTasks.filter(makeTaskFilter(this.task));
				this.project.blockedTasks.push(this.task);
				*/
			}else{
				/*this.project.blockedTasks = this.project.blockedTasks.filter(makeTaskFilter(this.task)); */
			}
		},
		doneMethod: function(event){
			this.task.done = !this.task.done;
			if(this.task.done){
				this.task.blocked =false;
				/*this.project.blockedTasks = this.project.blockedTasks.filter(makeTaskFilter(this.task));
				this.project.completedTasks.push(this.task);
				*/
			}else{
				/*this.project.completedTasks = this.project.completedTasks.filter(makeTaskFilter(this.task));*/
			}
		}
	}
});

function constructFilterFunc(search, propertyFilter){
	//0 implies get all tasks, 1 gets done tasks, 2 gets blocked tasks
	function filterByProperty(task){
		if(propertyFilter == 0){
			return true;
		}else if(propertyFilter == 1){
			return task['done'];
		}else{
			return task['blocked'];
		}
	}
	if(search === ""){
		return filterByProperty;
	}else{
		return function(task){
			const lowerCaseTaskText = task.text.toLowerCase();
			return filterByProperty(task) && lowerCaseTaskText.includes(search.toLowerCase());
		}
	}
}

const app = new Vue({
	el: '#app',
	data: {
		tasks:[done_task, blocked_task, task],
		display:0,
		newTaskPriority:0,
		newTaskText:"",
		newTaskDueDate:new Date(),
		search:""
	},
	computed:{
		searchedTasks:function(){
			return this.tasks.filter(constructFilterFunc(this.search, 0)).sort(sort_task_func);
		},
		completedTasks: function(){
			return this.tasks.filter(constructFilterFunc(this.search, 1)).sort(sort_task_func);
		},
		blockedTasks: function() {
			return this.tasks.filter(constructFilterFunc(this.search, 2)).sort(sort_task_func);
		}
	},
	components:{
		task:taskComponent
	},
 	methods:{
 		createTask: function(){
			date = new Date();
	        inputDueDate = new Date(this.newTaskDueDate);
	        if(date <= inputDueDate){
	            alert(`New Task Made With:(Name:${this.newTaskText},Due Date:${this.newTaskDueDate.toString()},Priority:${this.newTaskPriority}`);
	            const newId = incrementMaxId(this.tasks);
	            const task = createTaskObject(newId,this.newTaskText,false, false, this.newTaskPriority, inputDueDate);
	            this.tasks.push(task);
	        }else{
	            alert('Invalid due date');
	        }

 		}
 	}

});

