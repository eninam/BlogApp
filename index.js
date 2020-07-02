var express        = require("express"),
    methodOverride = require("method-override"),
    app            = express(),
    bodyParser     = require("body-parser"),
	passport       = require("passport"),
	LocalStrategy  = require("passport-local"),
	User = require("./models/user"),
    mongoose       = require("mongoose"),
	flash          = require("connect-flash");

// PASSPORT CONFIG
app.use(flash());

// set up express session
app.use(require("express-session")({
	secret: "The office is the best show",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// passes currentUser to every route
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.sucess = req.flash("sucess");
	next(); 
});




// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost/blog", {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
app.use(methodOverride("_method"));


// MONGOOSE/ MODEL CONFIG
var blogSchema = new mongoose.Schema({
	name: {
		id: {
			type: mongoose.Schema.Types.ObjectID, 
			ref: "User"
		},
		username: String
	},
	body: String,
	created: {type: Date, default: Date.now}
})

var Blog = mongoose.model("Blog",blogSchema);

// ROUTES
app.get("/", function(req, res) {
	res.redirect("/blogs");
});


app.get("/blogs", function(req, res) {
	
	Blog.find({}, function(err, blogs) {
	if(err) {
		console.log(err)
	} else {
		res.render("app", {blogs: blogs, currentUser: req.user});
	}
})
});

// New ROUTE
app.get("/blogs/new",isLogged, function(req, res) {
	res.render("new");
});

// CREATE ROUTE

app.post("/blogs", isLogged, function(req, res) {
	// created tweets
	Blog.create(req.body.blog, function(err, blog) {
		if(err) {
			res.render("new");
		} else {
			// add username and id to blog
			blog.name.id = req.user._id;
			blog.name.username = req.user.username;
			blog.save();
			res.redirect("blogs");
		}
	})
	// redirect
})

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog})
		}
	})
});

// Edit route
app.get("/blogs/:id/edit", checkBlogOwnership, function(req,res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			res.redirect("/blogs")
		} else {
			console.log("foundBlog");

			console.log(foundBlog);
			res.render("edit", {blog: foundBlog})
		}
	})
});

// UPDATE ROUTE
app.put("/blogs/:id", checkBlogOwnership, function(req, res) {
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if(err) {
			res.redirect("/blogs")
		} else {
			res.redirect("/blogs/");
		}
	})
});

// DELETE ROUTE
app.delete("/blogs/:id",checkBlogOwnership, function(req,res) {
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("/blogs");
		} else{
			res.redirect("/blogs") ;
		}
	})
});

// ====================================
// AUTH ROUTES
// ====================================
// show register form
app.get("/register", function(req, res){
	res.render("register")
});

// handle sign up logic
app.post("/register", function(req,res){
	var newUser = new User({username: req.body.username})
	User.register(newUser,req.body.password , function(err, user) {
		if(err) {
			console.log(err);
			return res.render("register")
		}
		passport.authenticate("local")(req, res, function() {
			res.redirect("/blogs");
		});
	});
});

// show login form
app.get("/login", function(req, res){
	res.render("login");
});

// login logic with middlewear
app.post("/login", passport.authenticate("local", 
	{
	successRedirect: "/blogs",
	failureRedirect: "/login"
	}) ,
	function(req,res) {
	res.send("login logic happend here")
});

// logout route
app.get("/logout", function(req,res) {
	req.logout();
	req.flash("sucess", "You successfully logged out. See you soon!");
	res.redirect("/blogs")
});

function isLogged(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "Please login!");
	res.redirect("/login");
}

function checkBlogOwnership(req, res, next) {
	if(req.isAuthenticated()) {
		Blog.findById(req.params.id, function(err, foundBlog) {
			if(err) {
				req.flash("error", "blog doesn't exist!");

				res.redirect("/blogs");
			} else {
				// does this user own the blog? 
				if(foundBlog.name.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "you didnt create this blog");

					res.redirect("/blogs");
				}
			}
		
	}); } 
		else {
			req.flash("error", "Please login!");

		    res.redirect("/blogs")
		}
}


app.listen(3000, process.env.IP, function() {
	console.log("server is running");
})