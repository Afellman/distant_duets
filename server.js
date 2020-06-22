var path = require('path')
var express = require('express');
var app = express();
const fs = require('fs');
const getMP3Duration = require('get-mp3-duration')
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const port = process.argv[2] || 80;
const fileUpload = require('express-fileupload');

// require('routes')(app, path)
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// use res.render to load up an ejs view file
app.use(express.static(__dirname + '/public'))
app.use(fileUpload());

// var transporter = nodemailer.createTransport(smtpTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'hummoscontactus@gmail.com',
//         pass: 'hummos1985'
//     }
// }))



// HTML Routes
app.get('/', function (req, res) {
    // fs.readdir(__dirname + "/public/audio", (err, items) => {
    //     console.log(items)
    //     res.render('pages/index', {
    //         tracks: items.map(item => {
    //             return { audio: item }
    //         })
    //     });
    // });


    //fs.readFile("analytics.json", (err, contents) => ({
//	
  //  });
    res.render("pages/index");
});

app.get('/contact', function (req, res) {
    res.render('pages/contact');
});

app.get('/about', function (req, res) {
    res.render('pages/about');
});

app.get('/backend', function (req, res) {
    res.render('pages/backend');
});


// app.get('/faq', function (req, res) {
//     res.render('pages/faq');
// });

// app.get('/links', function (req, res) {
//     res.render('pages/links');
// });



// API Routes
app.get("/tracks", (req, res) => {
    fs.readFile(__dirname + "/tracks.json", "utf-8", (err, items) => {
        const itemsParsed = JSON.parse(items);
        attachDuration(itemsParsed).then((itemsWithData) => {
            console.log(itemsWithData)
            res.send(itemsWithData);
        });
    });

});

app.post("/api/newSongText", (req, res) => {
    console.log(req.body);
});

app.post("/api/newSongAudio", (req, res) => {
    console.log(req.files);
});

app.post("/api/newSongImg", (req, res) => {
    console.log(req.files);
});

// app.post('/contact-submit', (req, res) => {
//     var mailOptions = {
//         from: 'hummoscontactus@gmail.com',
//         to: 'hummos1985@gmail.com',
//         cc: 'andrewfellman@abrahamsnatural.com',
//         subject: req.body.subject,
//         text: req.body.message,
//         replyTo: req.body.email,

//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//             console.log(error);
//         } else {
//             console.log('Email sent: ' + info.response);
//         }
//     });
//     console.log(req.body)
//     res.end('Submitted')
// })


function attachDuration(tracks) {
    return new Promise((resolve, reject) => {
        tracks.forEach(track => {
            const buffer = fs.readFileSync(__dirname + "/public" + track.audio);
            track.duration = getMP3Duration(buffer);
        });
        resolve(tracks);
    });
}


app.listen(port, () => {
    console.log(port + ' is the magic port');
});






