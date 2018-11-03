/*
 * Vue data schema:
 * projects : [{
 *  name:str,
 *  tasks:[{
 *      name: str,
 *      blocker: bool,
 *      done: bool,
 *      dueDate: DateTime,
 *      assignee: str,
 *  }],
 *  users:[{
 *      name: str,
 *  }]
 * }]
 */
let app = new Vue({
    el: '#app',
    data: {
        projects:[]
    },
    methods:{

    }
});