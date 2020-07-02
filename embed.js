var mongoose = require("mongoose");
// var post = require('./index.js');
mongoose.connect("mongodb://localhost/User");


// Post - title
var postSchema = new mongoose.Schema({
	title: String, 
	content: String
});
var Post = mongoose.model("Post", postSchema)

var newPost = new Post({
	title: "apple opiningon",
	content: "they are delicious"
});

newPost.save(function(err, post){
	if(err) {
		console.log(err);
	} else {
		console.log(post);
	}
});

// User - email and name 
var userSchema = new mongoose.Schema({
	email: String, 
	name: String,
	posts: [postSchema]
});

var User = mongoose.model("User", userSchema)

var newUser = new User({
	email: "Haryry@brown.edu", 
	name: "haryy browon"
});

newUser.posts.push({
	title: "how to be samrt", 
	content: "just kidding go to potion class to learn"
})

newUser.save(function(err, user){
	if(err) {
		console.log(err);
	} else {
		console.log(user)
	}
})



