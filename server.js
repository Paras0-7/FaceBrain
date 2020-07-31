const express = require('express');
const bodyParser=require('body-parser');
const bcrypt=require('bcrypt-nodejs');
const cors =require('cors');
const knex = require('knex');
const Clarifai =require('clarifai');
const image=require('./image.js')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const db=knex({
	client:'pg',
	connection:{
		connectionString :process.env.DATABASE_URL,
		ssl : true
	}
});
const app =express();

app.use(bodyParser.json());
app.use(cors());


app.get('/',(req,res)=>{
	res.send('it is working');
})

app.post('/signin',(req,res)=>{
	db.select('email','hash').from('login')
	.where('email','=',req.body.email)
	.then(data=>{
		const isValid=bcrypt.compareSync(req.body.password,data[0].hash);
		
		if(isValid){

			return db.select('*').from('users')
			.where('email','=',req.body.email)
			.then(user=>{
				res.json(user[0])
			})
			.catch(err=>res.status(400).json('unable to get user'))
		}else{
			res.status(400).json('wrong credentials')
		}
	})
	.catch(err=>res.status(400).json('wrong credentials'))
})

app.post('/register',(req,res)=>{
	const {email,name,password}=req.body;

	if(!email || !name || !password){
		return res.status(400).json('incorrect form submission');
	}
	const hash = bcrypt.hashSync(password);
	db.transaction(trx=>{
		trx.insert({
			hash:hash,
			email:email

		})
		.into('login')
		.returning('email')
		.then(login=>{
			return trx('users')
			.returning('*')
			.insert({
			email:login[0],
			name:name,
			joined:new Date()
	}).then(user=>{
		
		res.json(user[0]);
		})
	})
	.then(trx.commit)
	.catch(trx.rollback)
	})

	.catch(err=>res.status(400).json('unable to register'))
	
})

app.get('/profile/:id',(req,res)=>{
	const {id}=req.params;
	db.select('*').from('users').where({id}).then(user=>{
		if(user.length){

			res.json(user[0]);
		}
		else{
			res.status(400).json('user not found')
		}
	})
	.catch(err=>res.status(400).json('Error getting user'))
})
app.put('/image',(req,res)=>{image.Image(req,res,db)})
app.post('/imageurl',(req,res)=>{image.handle(req,res)})


app.listen(process.env.PORT || 3000,()=>{
	console.log(`app is running on port ${process.env.PORT} `);
})