const app=new Clarifai.App({
	apiKey:'8f9f8a2390e64dc4ab64c63dc41c8646'
});
const handle=(req,res)=>{
	app.models
	.predict (Clarifai.FACE_DETECT_MODEL, req.body.input)
	.then(data=>{
		res.json(data);
	})
	.catch(err=>res.status(400).json('unable to work with api'))
}

const Image=(req,res,db)=>{
	const {id,url}=req.body;
	if(url.length)
	{
		db('users').where('id','=',id)
		.increment('entries',1)
		.returning('entries')
		.then(entries=>{
		res.json(entries[0]);
	})
	.catch(err=>res.status(400).json('enable to get entries'))
	}else{
		res.json('Please enter a url to detect image');
	}
}

module.exports={
	handle,
	Image
}