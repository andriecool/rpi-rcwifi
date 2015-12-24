var express = require('express');
var app = express();

var wpi = require('wiring-pi');
wpi.setup('gpio');

var LEDLeftPin = 22;
var LEDRightPin = 23;

var in1 = 2;
var in2 = 3;
var in3 = 14;
var in4 = 15;

var blinkInterval;
var policeInterval;

app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

wpi.pinMode(in1, wpi.OUTPUT);
wpi.pinMode(in2, wpi.OUTPUT);
wpi.pinMode(in3, wpi.OUTPUT);
wpi.pinMode(in4, wpi.OUTPUT);

wpi.softPwmCreate(LEDLeftPin, 0, 100);
wpi.softPwmCreate(LEDRightPin, 0, 100);

function LEDNone(){
	wpi.softPwmWrite(LEDLeftPin, 0);
	wpi.softPwmWrite(LEDRightPin, 0);
}

function LEDLeft(v){
	wpi.softPwmWrite(LEDLeftPin, v);
	wpi.softPwmWrite(LEDRightPin, 0);
}

function LEDRight(v){
	wpi.softPwmWrite(LEDLeftPin, 0);
	wpi.softPwmWrite(LEDRightPin, v);
}

function LEDBoth(v){
	wpi.softPwmWrite(LEDLeftPin, v);
	wpi.softPwmWrite(LEDRightPin, v);
}

function LEDBlink(v){
	blinkInterval = setInterval(function(){
		LEDRight(0);
		LEDLeft(100);
		wpi.delay(v);
		LEDRight(100);
		LEDLeft(0);
	}, v)
}

function LEDBlinkStop(){
	clearInterval(blinkInterval);
}

function LEDPolice(v){
	clearInterval(policeInterval);
	policeInterval = setInterval(function(){
		wpi.softPwmWrite(LEDLeftPin, 100);
		wpi.softPwmWrite(LEDRightPin, 0);
		wpi.delay(v);
		wpi.softPwmWrite(LEDLeftPin, 0);
		wpi.softPwmWrite(LEDRightPin, 100);
		wpi.delay(v);
	},100)
}

function forward(){
	wpi.digitalWrite(in1, 1);
	wpi.digitalWrite(in2, 0);
	wpi.digitalWrite(in3, 1);
	wpi.digitalWrite(in4, 0);
}

function stop(){
	wpi.digitalWrite(in1, 0);
	wpi.digitalWrite(in2, 0);
	wpi.digitalWrite(in3, 0);
	wpi.digitalWrite(in4, 0);
}

function back(){
	wpi.digitalWrite(in1, 0);
	wpi.digitalWrite(in2, 1);
	wpi.digitalWrite(in3, 0);
	wpi.digitalWrite(in4, 1);	
}

function left(){
	wpi.digitalWrite(in1, 1);
	wpi.digitalWrite(in2, 0);
	wpi.digitalWrite(in3, 0);
	wpi.digitalWrite(in4, 1);	
}


function right(){
	wpi.digitalWrite(in1, 0);
	wpi.digitalWrite(in2, 1);
	wpi.digitalWrite(in3, 1);
	wpi.digitalWrite(in4, 0);	
}

app.get('/', function(req, res){
	res.render('index', {} );
});


app.get('/led/:d/:v', function(req, res){
	var d = req.params.d;
	var v = parseInt(req.params.v);
	if(d == 'left'){
		LEDLeft(v);
	} else if(d == 'right'){
		LEDRight(v);
	} else if(d == 'both'){
		LEDBoth(v);
	} else if(d == 'blink'){
		LEDBlink(500);
	} else if(d	 == 'blinkStop'){
		LEDBlinkStop();
	} else if(d	 == 'police'){
		LEDPolice(v);	
	} else {
		LEDNone();
	}
	// res.render('index', {} );
	res.send(0);
});

app.get('/rc', function(req, res){
	res.render('rc');
})

app.get('/rc/:d', function(req, res){
	var d = req.params.d;
	if(d == 'f'){
		forward();
	} else if (d == 'b'){
		back();
	} else if (d == 'l'){
		left();
	} else if (d == 'r'){
		right();
	} else {
		stop();
	}
	res.send(0);
})

// app.listen(8080);
var server = app.listen(8080, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('listening at http://%s:%s', host, port);
});