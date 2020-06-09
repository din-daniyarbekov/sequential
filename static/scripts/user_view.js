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

function createTaskObject(id, text, blocked, done, priority, dueDate){
	return {
		id: id,
		text: text,
        priority:priority,
		blocked: blocked,
		done: done,
		dueDate: dueDate	
	}
}

function updateTask(task, blocker, done, successCallback){
    request_body = {
		taskId: task.id,
        done: done,
        blocker: blocker
    }
    taskUpdateRequest = new Request('/user/update_task',{
        method:'PATCH',
        body: JSON.stringify(request_body),
        headers:constantHeaders,
    });
    fetch(taskUpdateRequest).then((res) => {
        if(res.status === 200){
            return res.blob();
        }else{
            throw new Error(res.blob());
        }
    }).then(successCallback).catch((e) => {
        alert("Task Update Failed");
    });
}

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
			function makeSuccessCallback(task){
				return function(blob){
					task.blocked = !task.blocked;
					if(task.blocked){
						task.done = false;
					}
				}
			}
			updateTask(this.task,!this.task.blocked, this.task.done, makeSuccessCallback(this.task));
		},
		doneMethod: function(event){
			function makeSuccessCallback(task){
				return function(blob){
					task.done = !task.done;
					if(task.done){
						task.blocked =false;
					}
				}
			}
			updateTask(this.task, this.task.blocked, !this.task.done, makeSuccessCallback(this.task));
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

getTasksData = {
	method: 'get',
	headers: constantHeaders,
}

getTasksRequest = new Request("/user/get_tasks", getTasksData)
fetch(getTasksRequest).then((res) => {
	if(res.status === 200){
		return res.json();
	}else{
		throw new Error(res.json());
	}
}).then((json) => {
		tasks = [];
		for(let json_task of json){
			task = createTaskObject(json_task.id, 
				json_task.text,
				json_task.blocker, 
				json_task.done, 
				json_task.priority, 
				new Date(json_task.dueDate));
			tasks.push(task);
		}
		const app = new Vue({
			el: '#app',
			data: {
				tasks: tasks,
				display:0,
				newTaskPriority:0,
				newTaskText:"",
				newDueDate:new Date(),
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
					// assume tasks are due at 11:59 pm on their due date
					current = new Date();
					dueDate = new Date(this.newDueDate);
					dueDate.setDate(dueDate.getDate()+1);
		
					if(current <= dueDate){
						if(this.newTaskText){
							const newId = incrementMaxId(this.tasks);
							const task = createTaskObject(newId,this.newTaskText,false, false, this.newTaskPriority, dueDate);
							requestBody = JSON.stringify({
								taskId:newId,
								text: this.newTaskText,
								dueDate: dueDate,
								priority: parseInt(this.newTaskPriority),
							});
							const createTaskRequest = new Request('/user/create_task', {
								method:'POST',
								headers: constantHeaders,
								body: requestBody
							});
							tasks = this.tasks;
							fetch(createTaskRequest).then(function(res){
								if(res.status === 200){
									return res.json();
								}else{
									alert("Task Creation Failed!");
									throw new Error();
								}
							}).then(function(json){
								alert(`New Task Made With:(Name:${this.newTaskText},Due Date:${this.newDueDate.toString()},Priority:${this.newTaskPriority}`);
								tasks.push(task);
							});
						}else{
							alert('Task name cannot be null');
						}
					} else{
						alert('Assigned due date cannot have already passed');
					}
				 }
			}
		});
}).catch((e) => {
	alert("You don't have any projects assigned to you");
	console.log(e);
});