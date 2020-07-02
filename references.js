var mongoose = require("mongoose");
// var post = require('./index.js');
mongoose.connect("mongodb://localhost/User_demo");


// Post - title
var postSchema = new mongoose.Schema({
	title: String, 
	content: String
});
var Post = mongoose.model("Post", postSchema)



// User - email and name 
var userSchema = new mongoose.Schema({
	email: String, 
	name: String,
	posts: [{
		type: mongoose.Schema.Types.ObjectID, 
		ref: "Post"
	}]
});

var User = mongoose.model("User", userSchema);

// User.create({
// 	email: "bob@brown", 
// 	name: "bob bel"
// })
// Post.create({
// 	title: "how to cook the best burger part2", 
// 	content: "ughip;ubo[ughip]0pj0"
// }, function(err, post) {
// 	User.findOne({email: "bob@brown"}, function(err, found) {
// 		if(err) {
// 			console.log(err)
// 		} else {
// 			found.posts.push(post);
// 			found.save(function(err, data) {
// 				if(err) {
// 					console.log(err)
// 				} else {
// 					console.log(data)
// 				}
// 			})
// 		}
// 	})
// })

// Find User// find all posts for that userSchema
User.findOne({email:"bob@brown"}).populate("posts").exec(function(err,user){
	if(err) {
		console.log(err)
	} else {
		console.log(user)
	}
})





