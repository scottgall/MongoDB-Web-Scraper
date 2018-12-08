var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes

// GET route for scraping articles
app.get("/scrape", function(req, res) {
  axios.get("https://www.theguardian.com/world/mongolia").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".js-headline-text").each(function(i, element) {
      // Save an empty result object
      var result = {};
      result.title = $(this)
        .text();
      result.link = $(this)
        .attr("href");
      db.Article.findOne({title:result.title}).then(function(data) {
        if(data === null) {
          db.Article.create(result).then(function(dbArticle) {
            res.json(dbArticle);
          });
        }
      }).catch(function(err) {
        res.json(err);
      });
    });
    // scrape success message
    res.send("Scrape Complete");
  });
});

// GET all articles
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(allArticles) {
      var savedArticles = allArticles.filter(article => article.isSaved === true);
      var unsavedArticles = allArticles.filter(article => article.isSaved === false);
      var articles = { 
        saved: savedArticles,
        unsaved: unsavedArticles};
      res.json(articles);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// GET article notes
app.get("/notes/:id", function(req, res) {
  db.Note.find({ article_id: req.params.id })
    .then(function(foundNotes) {
      res.json(foundNotes);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// DELETE article & notes
app.delete("/delete/:id", function(req, res) {
  db.Article.deleteOne({ _id: req.params.id })
    .populate("note")
    .then(function(success) {
      db.Note.deleteMany({ article_id: req.params.id })
        .then(function(success) {
      })
      res.json(success);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// DELETE all articles and notes
app.delete("/removeAll", function(req, res) {
  db.Article.remove()
  .then(function(articles) {
    db.Note.remove()
      .then(function(notes) {
        console.log('deleted all notes and articles');
      })
    res.json(articles)
  })
  .catch(function(err) {
    res.json(err);
  })
});

app.delete("/deleteScraped", function(req, res) {
  db.Article.deleteMany({ isSaved: false })
  .then(function(article) {
    res.json(article);
  })
  .catch(function(err) {
    res.json(err);
  })
})

app.delete("/deleteSaved", function(req, res) {
  db.Article.deleteMany({ isSaved: true })
  .then(function(article) {
    db.Note.remove();
    res.json(article);
  })
  .catch(function(err) {
    res.json(err);
  })
})

app.delete("/deleteNote/:id", function(req, res) {
  db.Note.deleteOne({ _id: req.params.id })
    .then(function(note) {
      res.json(note);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/deleteNotes/:id", function(req, res) {
  db.Note.deleteMany({ article_id: req.params.id })
    .then(function(article) {
      res.json(article);
    })
    .catch(function(err) {
      res.json(err);
    })
})

app.get("/getTitle/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .then(function(article) {
      res.json(article.title);
    })
    .catch(function(err) {
      res.json(err);
    })
})

// PUT save article
app.put("/articles/:id", function(req, res) {
  db.Article
    .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: req.body.setSaved }})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/notes/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// start server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
