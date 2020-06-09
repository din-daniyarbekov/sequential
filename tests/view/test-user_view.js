const expect = require('chai').expect;
const jest = require('jest-mock');

const createTaskObject = (id, text, blocked, done, priority, dueDate) => {
	return {
		id: id,
		text: text,
        priority:priority,
		blocked: blocked,
		done: done,
		dueDate: dueDate	
    }
}

const constantHeaders = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
}

const taskUpdateRequest = (task, blocker, done,) => {
    request_body = {
		taskId: task.id,
        done: done,
        blocker: blocker
    }
    return {
        url: '/user/update_task',
        request: {
            method:'PATCH',
            body: JSON.stringify(request_body),
            headers:constantHeaders,
        }
    }   
};


const updateTask = (task, blocker, done, successCallback) => {
    fetch(taskUpdateRequest(task, blocker, done)).then((res) => {
        if(res.status === 200){
            return res.blob();
        }else{
            throw new Error(res.blob());
        }
    }).then(successCallback).catch((e) => {
    });
}

describe('Testing the user view component', () => {
    it('check types', () => {
      expect(typeof createTaskObject).equal('function');
      expect(typeof taskUpdateRequest).equal('function');
      expect(typeof updateTask).equal('function');
    });

    it('check outputs of the functions', () =>{
        const mockTask = {id: 1, text: "mock", priority: 1, blocked: false, done: false, dueDate: 30};
        expect(createTaskObject(1, "mock", false, false, 1, 30)).to.eql(mockTask);

        const mockRequestBody = {
            taskId: 1,
            done: false,
            blocker: false
        };
        const mockRequest = ({
            url: '/user/update_task',
            request:{
                method:'PATCH',
                body: JSON.stringify(mockRequestBody),
                headers:constantHeaders,
            }
        }); 
        expect(taskUpdateRequest(mockTask, false, false)).to.eql(mockRequest);

        global.fetch = jest.fn(() => Promise.resolve());
        const callBackFunc = () =>{
            console.log("Callback function has been called");
        }
        expect(updateTask(mockTask, false, false, callBackFunc));
    })
})