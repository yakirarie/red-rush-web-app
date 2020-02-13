const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const {
    Client
} = require('pg');

const app = express();
const mustache = mustacheExpress();




mustache.cache = null;
app.engine('mustache', mustache);
app.set('view engine', 'mustache');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: false
}));



//dashboard
app.get('/dashboard', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'redrush',
        password: 'yakir1994',
        port: 5432,
    });
    client.connect().then(() => {
        console.log('connection complete');
        return client.query('select sum(three) as sum3, sum(four) as sum4, sum(five) as sum5, sum(six) as sum6, sum(seven) as sum7 from scores; select distinct count(id) from users');
    }).then((results) => {
        console.log('results?', results[0]);
        console.log('results?', results[1]);
        res.render('dashboard', {
            n1: results[0].rows,
            n2: results[1].rows
        });
    });
});
app.get('/users', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'redrush',
        password: 'yakir1994',
        port: 5432,
    });
    client.connect().then(() => {
        console.log('connection complete');
        return client.query('select * from users');
    }).then((results) => {
        console.log('results?', results);
        res.render('users', results);
    });
});

app.get('/scores', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'redrush',
        password: 'yakir1994',
        port: 5432,
    });
    client.connect().then(() => {
        console.log('connection complete');
        return client.query('select scores.id,three,four,five,six,seven,users.username from scores join users on scores.uid=users.id order by scores.id');
    }).then((results) => {
        console.log('results?', results);
        res.render('scores', results);
    });
});

app.get('/add', (req, res) => res.render('login-form'));

app.get('/game/:id/:name', (req, res) => res.render('game', {
    username: req.params.name,
    id: req.params.id
}));

app.post('/users/add', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'redrush',
        password: 'yakir1994',
        port: 5432,
    });
    if (req.body.password != req.body.password_rep) {
        res.render('login-form', {
            error: "Passwords don't match"
        });
    } else {
        let user = null;
        client.connect().then(() => {
                console.log('connection complete');
                const sql = 'insert into users(username, email, password) values($1, $2, $3)';
                const params = [req.body.username, req.body.email, req.body.password];
                return client.query(sql, params);
            }).then((results) => {
                console.log('created new user');
                const sql = 'select * from users where email=$1';
                const params = [req.body.email];
                return client.query(sql, params);
            }).catch((err) => {
                res.render('login-form', {
                    error: "Email already in use"
                });
                throw err;
            })
            .then((results) => {
                user = results.rows[0];
                console.log('creating user data');
                const sql = 'insert into scores(three, four, five, six, seven,uid) values(0,0,0,0,0,$1)';
                const params = [user.id];
                return client.query(sql, params);
            })
            .then((results) => {
                console.log('starting game');
                res.redirect('/game/' + user.id + '/' + user.username);
            });
    }

});

app.post('/users/reg', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'redrush',
        password: 'yakir1994',
        port: 5432,
    });
    client.connect()
        .then((results) => {
            console.log('results?', results);
            const sql = 'select * from users where email=$1 and password=$2';
            const params = [req.body.email_reg, req.body.password_reg];
            return client.query(sql, params);
        })
        .then((results) => {
            console.log('results?', results);

            if (results.rows[0] != null) {
                let user = results.rows[0];
                res.redirect('/game/' + user.id + '/' + user.username);
            } else
                res.render('login-form', {
                    error: "User does not exists or wrong password"
                });
        });

});

app.post('/users/delete/:id', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'redrush',
        password: 'yakir1994',
        port: 5432,
    });
    client.connect().then(() => {
        console.log('connection complete');
        const sql = 'delete from users where id=$1';
        const params = [req.params.id];
        return client.query(sql, params);
    }).then((results) => console.log('results?', results));

    res.redirect('/users');
});

app.get('/users/edit/:id', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'redrush',
        password: 'yakir1994',
        port: 5432,
    });
    client.connect().then(() => {
        console.log('connection complete');
        const sql = 'select * from users where id=$1';
        const params = [req.params.id];
        return client.query(sql, params);
    }).then((results) => {
        console.log('results?', results);
        res.render('user-edit', {
            user: results.rows[0]
        });
    });

});

app.post('/users/edit/:id', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'redrush',
        password: 'yakir1994',
        port: 5432,
    });
    client.connect().then(() => {
        console.log('connection complete');
        const sql = 'update users set username=$1, email=$2, password=$3 where id=$4';
        const params = [req.body.username, req.body.email, req.body.password, req.params.id];
        return client.query(sql, params);
    }).then((results) =>
        console.log('results?', results)
    );
    res.redirect('/users');

});

app.post('/publish/:count/:size/:uid/:username', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'redrush',
        password: 'yakir1994',
        port: 5432,
    });
    client.connect().then(() => {
        console.log('connection complete');
        const col = numberToString(req.params.size);
        const sql = 'update scores set ' + col + '=$1 where uid=$2';
        console.log("colcheck", col);
        const params = [req.params.count, parseInt(req.params.uid)];
        return client.query(sql, params);
    }).then((results) =>{
        console.log('results?', results);
        res.redirect('/game/'+req.params.uid+'/'+req.params.username);

        }
    );

});

function numberToString(num) {
    switch (parseInt(num)) {
        case (3):
            return 'three';
        case (4):
            return 'four';
        case (5):
            return 'five';
        case (6):
            return 'six';
        case (7):
            return 'seven';
    }
}
app.listen(5001, () => console.log("Listening to port 5001"));