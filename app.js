var express       = require("express"),
    app           = express(),
    bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground    = require("./models/campground"),
    Comment       = require("./models/comment"),
    User          = require("./models/user");


    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// var data = [
//     {
//         name: "Cloud's Rest", 
//         image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
//         description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
//     },
//     {
//         name: "Desert Mesa", 
//         image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
//         description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
//     },
//     {
//         name: "Canyon Floor", 
//         image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
//         description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
//     }
// ]
 
// function seedDB(){
//    //Remove all campgrounds
//    Campground.remove({}, function(err){
//         if(err){
//             console.log(err);
//         }
//         console.log("removed campgrounds!");
//         Comment.remove({}, function(err) {
//             if(err){
//                 console.log(err);
//             }
//             console.log("removed comments!");
//              //add a few campgrounds
//             data.forEach(function(seed){
//                 Campground.create(seed, function(err, campground){
//                     if(err){
//                         console.log(err)
//                     } else {
//                         console.log("added a campground");
//                         //create a comment
//                         Comment.create(
//                             {
//                                 text: "This place is great, but I wish there was internet",
//                                 author: "Homer"
//                             }, function(err, comment){
//                                 if(err){
//                                     console.log(err);
//                                 } else {
//                                     campground.comments.push(comment);
//                                     campground.save();
//                                     console.log("Created new comment");
//                                 }
//                             });
//                     }
//                 });
//             });
//         });
//     }); 
//     //add a few comments
// }

// seedDB();

//ROUTRS START HERE

//  PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Love is the eternal thing I have ever seen",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);


app.get("/", function(req, res) {
    res.render("landing");
});

//INDEX- shows all campgrounds
app.get("/campgrounds", function(req, res) {
    //retrive info from db and add it to db
    Campground.find({},function(err, allCampgrounds) {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

//CREATE-adding new campground to db and redirecting
app.post("/campgrounds", function(req, res) {
    //retrive info from form and add it to the array
    var newCampground ={    name: req.body.name,
                            image: req.body.image,
                            description: req.body.description
                        };
    //add new campground to db
    Campground.create(newCampground, function(err, campground) {
          if(err){
              console.log(err);
          } else{
            //redirecting back to campground
            res.redirect("/campgrounds");
          }
    });
});

//NEW-shows form to create new campground
app.get("/campgrounds/new", function(req, res) {
    res.render("campgrounds/new");
})

//SHOW-shows more info about particular campground
app.get("/campgrounds/:id", function(req, res) {
    //find that of the id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err){
            console.log(err);
        } else {
            //render show template of that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//COMMENT CREATING FORM ROUTE

app.get("/campgrounds/:id/comments/new", isLoggedIn , function(req, res) {
    //find id and send it to form
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

//POST ROUTE TO SUBMIT A NEW COMMENT

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {
    //find campground
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
            redirect("/campgrounds");
        } else{
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {
                    console.log(err);
                } else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
    //create a new comment

    //connect it to campground

    //redirect to SHOW page
});

//=============
//AUTH ROUTES
//=============
app.get("/register", function(req, res) {
    res.render("register");
});

//handle sign up logic 
app.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            return res.render("register");
        } else{
            res.redirect("/campgrounds");
        }
    });
    // var newUser = new User({username: req.body.username});
    // User.register(newUser, req.body.password, function(err, user){
    //     if(err){
    //         console.log(err);
    //         return res.render("register");
    //     }
    //     passport.authenticate("local")(req, res, function(){
    //        res.redirect("/campgrounds"); 
    //     });
    // })
});  

//show login form
app.get("/login", function (req, res) {
    res.render("login");
});

// handling login logic
app.post("/login", function(req, res){

    req.login(req.body, function(err) {
        if (err) {
            return next(err);
        }
        return res.redirect("/campgrounds");
    });
});


//logout route
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campgrounds");
 });


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(1000, function(){
    console.log("The Yelp Camp Server Has Started");
});