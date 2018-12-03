const sort_task_func = function(first_task,second_task){
    if(first_task.dueDate < second_task.dueDate){
        return -1;
    }else if(second_task.dueDate < first_task.dueDate){
        return 1;
    }else if(first_task.priority < second_task.priority){
        return -1;
    }else if(second_task.priority < first_task.priority){
        return 1;
    }
    return 0;
}
const incrementMaxId = function(elementList){
    const ids = elementList.map((element) => element.id);
    const maxId = ids.reduce((acc,id) => {
        return Math.max(acc, id);
    });
    return maxId + 1;
}

const working_date = new Date();
working_date.setHours(0);
working_date.setMinutes(0);
working_date.setSeconds(0);
working_date.setMilliseconds(0);
let addDays = (oldDate,days) => {
    const oldTime = oldDate.getTime();
    const newDate = new Date(oldDate.setTime(oldTime + days * 86400000));
    oldDate.setTime(oldTime);
    return newDate;
};
const today = new Date(working_date);
const yesterday = addDays(working_date, -1);
const withinNextWeek = addDays(working_date, 4);
const withinNextMonth = addDays(working_date, 10);
const withinNextYear = addDays(working_date, 35);