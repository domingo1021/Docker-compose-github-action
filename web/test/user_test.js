require('dotenv').config();
const {expect, requester} = require('./set_up');
const {users} = require('./fake_data');
const sinon = require('sinon');
const {pool} = require('../server/models/mysqlcon');

const expectedExpireTime = process.env.TOKEN_EXPIRE;
const fbTokenSignInFirstTime = 'fbTokenFirstLogin';
const fbTokenSignInAgain = 'fbTokenLoginAgain';
const fbProfileSignInFirstTime = {
    id: 1111,
    name: 'fake fb user',
    email: 'fakefbuser@gmail.com'
};
const fbProfileSignInAgain = {
    id: 2222,
    name: users[1].name,
    email: users[1].email
};
let stub;

describe('user', () => {

    before(() => {
        const userModel = require('../server/models/user_model');
        const fakeGetFacebookProfile = (token) => {
            if (!token) {
                return Promise.resolve();
            } else {
                if (token === fbTokenSignInFirstTime) {
                    return Promise.resolve(fbProfileSignInFirstTime);
                } else if (token === fbTokenSignInAgain) {
                    return Promise.resolve(fbProfileSignInAgain);
                } else {
                    return Promise.reject({error: {code: 190}});
                }
            }
        };
        stub = sinon.stub(userModel, 'getFacebookProfile').callsFake(fakeGetFacebookProfile);
    });

    /**
     * Sign Up
     */

    it('sign up', async () => {
        const user = {
            name: 'arthur',
            email: 'arthur@gmail.com',
            password: 'password'
        };

        const res = await requester
            .post('/api/1.0/user/signup')
            .send(user);

        const data = res.body.data;

        const userExpected = {
            id: data.user.id, // need id from returned data
            provider: 'native',
            name: user.name,
            email: user.email,
            picture: null
        };

        expect(data.user).to.deep.equal(userExpected);
        expect(data.access_token).to.be.a("string")
        expect(data.access_expired).to.equal(expectedExpireTime);
        expect(new Date(data.login_at).getTime()).to.closeTo(Date.now(), 1000);
    });

    it('sign up without name or email or password', async () => {
        const user1 = {
            email: 'arthur@gmail.com',
            password: 'password'
        };

        const res1 = await requester
            .post('/api/1.0/user/signup')
            .send(user1);

        expect(res1.statusCode).to.equal(400);

        const user2 = {
            name: 'arthur',
            password: 'password'
        };

        const res2 = await requester
            .post('/api/1.0/user/signup')
            .send(user2);

        expect(res2.statusCode).to.equal(400);

        const user3 = {
            name: 'arthur',
            email: 'arthur@gmail.com',
        };

        const res3 = await requester
            .post('/api/1.0/user/signup')
            .send(user3);

        expect(res3.statusCode).to.equal(400);
    });

    it('sign up with existed email', async () => {
        const user = {
            name: users[0].name,
            email: users[0].email,
            password: 'password'
        };

        const res = await requester
            .post('/api/1.0/user/signup')
            .send(user);

        expect(res.body.error).to.equal('Email Already Exists');
    });

    it('sign up with malicious email', async () => {
        const user = {
            name: users[0].name,
            email: '<script>alert(1)</script>',
            password: 'password'
        };

        const res = await requester
            .post('/api/1.0/user/signup')
            .send(user);

        expect(res.body.error).to.equal('Request Error: Invalid email format');
    });

    /**
     * Native Sign In
     */

    it('native sign in with correct password', async () => {
        const user1 = users[0];
        const user = {
            provider: user1.provider,
            email: user1.email,
            password: user1.password
        };

        const res = await requester
            .post('/api/1.0/user/signin')
            .send(user);

        const data = res.body.data;
        const userExpect = {
            id: data.user.id, // need id from returned data
            provider: user1.provider,
            name: user1.name,
            email: user1.email,
            picture: null
        };

        expect(data.user).to.deep.equal(userExpect);
        expect(data.access_token).to.be.a("string")
        expect(data.access_expired).to.equal(expectedExpireTime);

        // make sure DB is changed, too
        const loginTime = await pool.query(
            'SELECT login_at FROM user WHERE email = ?',
            [user.email]
        );

        expect(new Date(data.login_at).getTime()).to.closeTo(Date.now(), 1000);
        expect(new Date(loginTime[0][0].login_at).getTime()).to.closeTo(Date.now(), 1000);
    });

    it('native sign in without provider', async () => {
        const user1 = users[0];
        const user = {
            email: user1.email,
            password: user1.password
        };

        const res = await requester
            .post('/api/1.0/user/signin')
            .send(user);

        expect(res.body.error).to.equal('Wrong Request');
    });

    it('native sign in without email or password', async () => {
        const user1 = users[0];
        const userNoEmail = {
            provider: user1.provider,
            password: user1.password
        };

        const res1 = await requester
            .post('/api/1.0/user/signin')
            .send(userNoEmail);

        expect(res1.status).to.equal(400);
        expect(res1.body.error).to.equal('Request Error: email and password are required.');

        const userNoPassword = {
            provider: user1.provider,
            email: user1.email,
        };

        const res2 = await requester
            .post('/api/1.0/user/signin')
            .send(userNoPassword);

        expect(res2.status).to.equal(400);
        expect(res2.body.error).to.equal('Request Error: email and password are required.');
    });

    it('native sign in with wrong password', async () => {
        const user1 = users[0];
        const user = {
            provider: user1.provider,
            email: user1.email,
            password: 'wrong password'
        };

        const res = await requester
            .post('/api/1.0/user/signin')
            .send(user);

        expect(res.status).to.equal(403);
        expect(res.body.error).to.equal('Password is wrong');
    });

    it('native sign in with malicious password', async () => {
        const user1 = users[0];
        const user = {
            provider: user1.provider,
            email: user1.email,
            password: '" OR 1=1; -- '
        };

        const res = await requester
            .post('/api/1.0/user/signin')
            .send(user);

        expect(res.status).to.equal(403);
        expect(res.body.error).to.equal('Password is wrong');
    });


    /**
     * Facebook Sign In
     */

    it('facebook sign in first time with correct token', async () => {
        const user = {
            provider: 'facebook',
            access_token: fbTokenSignInFirstTime
        };

        const res = await requester
            .post('/api/1.0/user/signin')
            .send(user);

        const data = res.body.data;

        const expectedUser = {
            id: data.user.id,
            provider: user.provider,
            name: fbProfileSignInFirstTime.name,
            email: fbProfileSignInFirstTime.email,
            picture: `https://graph.facebook.com/${fbProfileSignInFirstTime.id}/picture?type=large`,
        };

        expect(data.user).to.deep.equal(expectedUser);

        expect(data.access_expired).to.equal(expectedExpireTime);
        expect(new Date(data.login_at).getTime()).to.closeTo(Date.now(), 1000);
    });

    it('facebook sign in again with correct email and password', async () => {
        const user = {
            provider: 'facebook',
            email: fbProfileSignInFirstTime.email,
            access_token: fbTokenSignInAgain
        };

        const res = await requester
            .post('/api/1.0/user/signin')
            .send(user);

        const data = res.body.data;

        const expectedUser = {
            id: data.user.id,
            provider: user.provider,
            name: fbProfileSignInAgain.name,
            email: fbProfileSignInAgain.email,
            picture: `https://graph.facebook.com/${fbProfileSignInAgain.id}/picture?type=large`,
        };

        expect(data.user).to.deep.equal(expectedUser);

        expect(data.access_expired).to.equal(expectedExpireTime);

        // make sure DB is changed, too
        const loginTime = await pool.query(
            'SELECT login_at FROM user WHERE provider = ? AND email = ?',
            [user.provider, user.email]
        );

        expect(new Date(data.login_at).getTime()).to.closeTo(Date.now(), 1000);
        expect(new Date(loginTime[0][0].login_at).getTime()).to.closeTo(Date.now(), 1000);
    });

    it('facebook sign in without access_token', async () => {
        const user = {
            provider: 'facebook',
        };

        const res = await requester
            .post('/api/1.0/user/signin')
            .send(user);

        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal('Request Error: access token is required.');
    });

    it('facebook sign in wrong access_token', async () => {
        const user = {
            provider: 'facebook',
            access_token: 'wrong_token'
        };

        const res = await requester
            .post('/api/1.0/user/signin')
            .send(user);

        expect(res.body.error.error.code).to.equal(190);
    });

    /**
     * Get User Profile
     */

    it('get profile with valid access_token', async () => {
        const user = {
            provider: 'facebook',
            access_token: fbTokenSignInFirstTime
        };

        const res1 = await requester
            .post('/api/1.0/user/signin')
            .send(user);

        const user1 = res1.body.data.user;

        const accessToken = res1.body.data.access_token;
        const res2 = await requester
            .get('/api/1.0/user/profile')
            .set('Authorization', `Bearer ${accessToken}`);

        const user2 = res2.body.data;
        const expectedUser = {
            provider: user1.provider,
            name: fbProfileSignInFirstTime.name,
            email: fbProfileSignInFirstTime.email,
            picture: `https://graph.facebook.com/${fbProfileSignInFirstTime.id}/picture?type=large`
        };

        expect(user2).to.deep.equal(expectedUser);
    });

    it('get profile without access_token', async () => {
        const res = await requester
            .get('/api/1.0/user/profile');

        expect(res.status).to.equal(401);
    });

    it('get profile with invalid access_token', async () => {
        const res = await requester
            .get('/api/1.0/user/profile')
            .set('Authorization', 'Bearer wrong_token');

        expect(res.status).to.equal(403);
    });

    after(() => {
        stub.restore();
    });
});