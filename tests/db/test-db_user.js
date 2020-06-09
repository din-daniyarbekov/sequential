const mongoose = require('mongoose');
const expect = require('chai').expect;

const {User} = require('../../server/models/users');

const userData = {
    name: "dummyUser",
    email: "dummy@mail.com",
    password: "abcdefgh",
    isAdmin: false,
    tokens:[{
        access: "auth",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWRiZjExMjBiYmUxMTEyYzk1MmQxYzEiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTkxNDcyNDAyfQ.sDy1q1tGDNqxqUnuS4BMOMFHrUGne3Mgg2t855AWMWk"
    }]
}

describe.skip('User Model Test', () => {
    beforeEach(async () => {
        await mongoose.connect('mongodb://localhost:2717/SequenceApp', (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });

    afterEach(() => mongoose.connection.close());

    it('create & save user successfully', async () => {
        const validUser = new User(userData);
        const savedUser = await validUser.save();
        expect(savedUser._id).to.not.be.null;
        expect(savedUser.name).to.eql(userData.name);
        expect(savedUser.email).to.eql(userData.email);
        expect(savedUser.isAdmin).to.eql(userData.isAdmin);
    });

    it('search for successfully', async () => {
        const user = User.findOne({email:"dummy1@mail.com"}).then((user) => {
            console.log(user);
        }).catch((e) =>{
            console.log(e);
        });
        expect(user).to.not.be.null;
    });
})