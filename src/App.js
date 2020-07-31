import React from 'react';
import Navigation from './components/Navigation';
import Logo from './components/Logo';

import ImageLinkForm from './components/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition';
import Rank from './components/Rank';
import Signin from './components/Signin'
import './App.css';
import Particles from 'react-particles-js';
import './components/FaceRecognition.css'
import Register from './components/Register';


const particle={
	particles:{ 
		number: {
			value:20,
			density:{
				enable:true,
				value_area:100
			}
		}
	}
}
const initial={
			input:'',
			imgUrl: '',
			box:{},
			route:'signin',
			isSignin:false,
			user:{
				id:'',
				name:'',
				email:'',
				entries:0,
				joined:''
			}
		}

class App extends React.Component{
	constructor(){
		super();
		this.state=initial;
		}
	

	loadUser=(data)=>{
		this.setState({user:{
				id:data.id,
				name:data.name,
				email:data.email,
				entries:data.entries,
				joined:data.joined

		}})
	}

	FaceLocation=(data)=>{
		const Face=data.outputs[0].data.regions[0].region_info.bounding_box;
		const image=document.getElementById('inputimage');
		const width=Number(image.width);
		const height=Number(image.height);
		console.log(width, height);
		return{
			leftCol:Face.left_col * width,
			topRow:Face.top_row*height,
			rightCol:width-(Face.right_col*width),
			bottomRow: height-(Face.bottom_row*height)
			
		}
		

	}

	displayFaceBox=(box)=>{
		this.setState({box:box});
	}
	

	onInputChange=(event) =>{
		this.setState({input: event.target.value});
	}

	onSubmit=() =>{
		this.setState({imgUrl:this.state.input})
			fetch('https://boiling-beach-55179.herokuapp.com/imageurl',{
					method:'post',
					headers:{'Content-Type':'application/json'},
					body:JSON.stringify({
					input:this.state.input,
					

					})
				})
			.then(response=>response.json())
			.then(response=>{
			if(response){
				fetch('https://boiling-beach-55179.herokuapp.com/image',{
					method:'put',
					headers:{'Content-Type':'application/json'},
					body:JSON.stringify({
					id:this.state.user.id,
					url:this.state.imgUrl

					})
				})
				.then(response=>response.json())
				.then(count=>{
					if(count!='Please enter a url to detect image'){
						this.setState(Object.assign(this.state.user,{entries:count}))
					}else{
						alert(count)
					}
				})
			}
			
			this.displayFaceBox(this.FaceLocation(response))
		})
		.catch(err=>console.log(err));
	
	}
	onRouteChange=(route)=>{
		if(route==='signout'){
			this.setState(initial)
		}else if(route==='home'){
			this.setState({isSignin:true})
		}
		this.setState({route:route});
	}
	render(){
		return (
			<div className='App'>
				<Particles className='particles'
				params={particle}
				/>
			
				<Navigation isSignin={this.state.isSignin} onRouteChange={this.onRouteChange}/>
				{this.state.route === 'home'
					?<div>
						<Logo />
						<Rank name={this.state.user.name} 
						entries={this.state.user.entries}
						/>
						<ImageLinkForm  onInputChange={this.onInputChange}  onButtonSubmit={this.onSubmit}/>
						<FaceRecognition  box={this.state.box} imageUrl= {this.state.imgUrl} />
					</div>
					:(
						this.state.route==='signin'
						?<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
						:<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
					)
				}
			</div>

			);
		}
}
export default App;