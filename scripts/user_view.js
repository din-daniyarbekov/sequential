/*
 * Vue data schema:
 * tasks:[{
 *  name: str,
 *  blocker: bool,
 *  done: bool,
 *  dueDate: DateTime,
 *  assignee: str
 * }]
 */

let app = new Vue({
    el: '#app',
    data: {
        tasks:[]
    },
    methods:{

    }
});