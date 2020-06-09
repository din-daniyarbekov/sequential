const expect = require('chai').expect;
const assert = require('chai').assert;

const jest = require('jest-mock');

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


const validateEmail = (email) => {
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return expression.test(String(email).toLowerCase());
}


const foundUserFunction = function(emailToFind, nameToFind){
    return function(user){
        return user.email === emailToFind || user.name === nameToFind;
    }
}



describe('Testing the user view component', () => {
    it('check types', () => {
      expect(typeof createProjectObject).equal('function');
      expect(typeof makeTaskFilter).equal('function');
      expect(typeof validateEmail).equal('function');
      expect(typeof foundUserFunction).equal('function');
    });

    it('check outputs of the functions', () =>{
        const mockTaskOne = {id: 1, text: "mock", priority: 1, blocked: false, done: false, dueDate: 30};
        const mockTaskTwo = {id: 2, text: "mock", priority: 1, blocked: true, done: false, dueDate: 30};
        const mockTasksThree = {id: 3, text: "mock", priority: 1, blocked: false, done: true, dueDate: 30};
        const mockTasks = [mockTaskOne, mockTaskTwo, mockTasksThree];
        const mockUsers = ["user1"];
        const mockProject = {
            name: "project",
            display: "shopify project",
            completedTasks: [mockTasksThree],
            blockedTasks: [mockTaskTwo],
            tasks: mockTasks,
            users: mockUsers,
            seen: false,
            create: false
        }
        expect(createProjectObject("project", "shopify project", mockTasks, mockUsers)).to.eql(mockProject);
        
        const mockTaskToFilterBy = {id: 4, text: "mock", priority: 1, blocked: false, done: false, dueDate: 30};
        const filterFunction = makeTaskFilter(mockTaskToFilterBy);
        expect(filterFunction(mockTaskToFilterBy)).equal(false);
        expect(filterFunction(mockTaskTwo)).equal(true);

        expect(validateEmail('abcd@mail.com')).equal(true);
        expect(validateEmail('abcd')).equal(false);

        const mockUser = {
            name: "user",
            email: "user@mail.com"
        };
        const filterUserFunction = foundUserFunction(mockUser);
        expect(filterUserFunction(mockUser)).equal(false);

    })
})