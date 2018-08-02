$(function() {

// Grab the articles as a json

function renderArticles () {
  console.log('rendering')
  $('#articles').empty();
  $('#saved').empty();

  $.ajax({
    method: "GET",
    url: "/articles"
  })
    .then(function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      var section = '#saved';
      var toggleButtonText = 'REMOVE';
      var button2Class = 'notes-button';
      var button2Text = 'NOTES';
      var isSaved = true;
      // Display the apropos information on the page
      if (data[i].isSaved === false) {
        section = '#articles';
        toggleButtonText = 'SAVE';
        button2Class = 'delete-button';
        button2Text = 'X';
        isSaved = false;
      } 

      $(`${section}`).append(`<div><a data-id='${data[i]._id}'>${data[i].title}<br />${data[i].link}</a></br><button class='toggle-saved' data-id='${data[i]._id}' data-isSaved=${isSaved}>${toggleButtonText}</button><button class=${button2Class} data-id='${data[i]._id}'>${button2Text}</button></div><br><hr></br>`);
    }
  });
}

$('#scrape').click(function() {
  console.log('what')
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    .then(function() {
      setTimeout(function(){ renderArticles(); }, 1000);
    });
});

// changes isSaved to true
$(document).on("click", ".toggle-saved", function() {
  var articleId = $(this).attr("data-id");
  var setSaved = '';
  if ($(this).attr("data-isSaved") === 'false') {
    setSaved = true;
  } else {
    setSaved = false;
  }

  $.ajax({
    method: "PUT",
    url: "/articles/" + articleId,
    data: { 'setSaved' : setSaved }
  })
  
  .done(function(data) {
      console.log('updated isSaved')
      console.log(data);
      renderArticles();
      $('#notes').empty();
  });
});

// When user clicks the delete button for an article
$(document).on("click", ".delete-button", function() {
  
  // Save the p tag that encloses the button
  var selected = $(this);
  // Make an AJAX GET request to delete the specific note
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/delete/" + selected.attr("data-id"),

    // On successful call
    success: function(response) {

      renderArticles();
      $('#notes').empty();
      // Remove the p-tag from the DOM
      // Clear the note and title inputs
      // $("#note").val("");
      // $("#title").val("");
      // Make sure the #action-button is submit (in case it's update)
      // $("#action-button").html("<button id='make-new'>Submit</button>");
    }
  });
});

// When user clicks the delete button for a note
$(document).on("click", ".notes-button", function() {
  
  // Save the p tag that encloses the button
  var selected = $(this);
  renderNotes(selected.attr('data-id'));
  // Make an AJAX GET request to delete the specific note
  // this uses the data-id of the p-tag, which is linked to the specific note
  // $.ajax({
  //   type: "GET",
  //   url: "/notes/" + selected.attr("data-id"),

  //   // On successful call
  //   success: function(response) {
  //     $('#notes').html(`<div>Article: ${selected.attr('data-id')}</div>`);
  //     console.log('dude');
  //     if (response.length < 1) {
  //       $('#notes').append(`<div>no notes for this article</div>`);
  //     } else {
  //       for (var i = 0; i < response.length; i++) {
          
  //       } 
  //     }
  //     $('#notes').append('<input class="notes-input"><br><button class="submit-note-button">submit note</button>');
  //   }
  // });
});

function renderNotes(articleId) {
  $.ajax({
    type: "GET",
    url: "/notes/" + articleId,

    // On successful call
    success: function(response) {
      $('#notes').html(`<div>Article: ${articleId}</div>`);
      console.log('dude');
      if (response.length < 1) {
        $('#notes').append(`<div>no notes for this article</div>`);
      } else {
        for (var i = 0; i < response.length; i++) {
          console.log(response[i].body);
          $('#notes').append(`<div>-${response[i].body}</div><button class='delete-note' data-id='${response[i]._id}' article-id='${articleId}'>X</button><br>`);
          
        } 
      }
      $('#notes').append(`<input class="notes-input"><br><button class="submit-note-button" data-id=${articleId}>submit note</button>`);
    }
  });

}



// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", ".submit-note-button", function() {
  console.log('mang')
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/notes/" + thisId,
    data: {
      // Value taken from title input
      // title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $(".notes-input").val(),
      article_id: thisId

    }
  })
    // With that done
    .then(function(data) {
      console.log('added note')
      renderNotes(thisId);
      // Log the response
      // console.log(data);
      // Empty the notes section
      // $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $(".notes-input").val("");
  // renderArticles(thisId);

});

// When user clicks the delete button for a note
$(document).on("click", ".delete-note", function() {
  
  // Save the p tag that encloses the button
  var selected = $(this);
  // Make an AJAX GET request to delete the specific note
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/deleteNote/" + selected.attr("data-id"),

    // On successful call
    success: function(response) {

      renderNotes(selected.attr('article-id'));
      // Remove the p-tag from the DOM
      // Clear the note and title inputs
      // $("#note").val("");
      // $("#title").val("");
      // Make sure the #action-button is submit (in case it's update)
      // $("#action-button").html("<button id='make-new'>Submit</button>");
    }
  });
});

renderArticles();


});
