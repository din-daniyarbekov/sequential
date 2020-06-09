const mongoose = require('mongoose');
const expect = require('chai').expect;

const {Projects} = require('../../server/models/projects');

const projectData = {
    name: "dummyProject",
    tasks: [],
    admin: mongoose.Types.ObjectId("4edd40c86762e0fb12000003"),
    projectUsers: []
}

describe.skip('Admin Model Test', () => {
    beforeEach(async () => {
        await mongoose.connect('mongodb://localhost:2717/SequenceApp', (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });

    afterEach(() => mongoose.connection.close());

    it('create & save project successfully', async () => {
        const validProject = new Projects(projectData);
        const savedProject = await validProject.save();
        expect(savedProject._id).to.not.be.null;
        expect(savedProject.name).to.eql(projectData.name);
        expect(savedProject.tasks).to.eql(projectData.tasks);
        expect(savedProject.admin).to.eql(projectData.admin);
    });

    it('search for successfully', async () => {
        const project = Projects.findOne({name:"dummyProject"}).then((projectFound) => {
            console.log(projectFound);
        }).catch((e) =>{
            console.log(e);
        });
        expect(project).to.not.be.null;
    });
})