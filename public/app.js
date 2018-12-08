$(function() {

// GET articles
function renderArticles () {
  $('#articles').empty();
  $('#saved').empty();
  $('#notes').empty();

  $.ajax({
    method: "GET",
    url: "/articles"
  }).then(function(data) {
    console.log(data);
    if (data.saved.length > 0) {
      let section = '#saved';
      let toggleButtonText = 'UN-SAVE';
      let button2Class = 'notes-button';
      let button2Text = 'NOTES';
      let isSaved = true;

      $(`${section}`).append(`<button id="deleteSaved">CLEAR SAVED ARTICLES</button>`);
      for (let article of data.saved) {
        $(`${section}`).append(`
        <div class="individual-article">
          <a style="font-style: italic;" data-id='${article._id}'>
            ${article.title}</a>
          <br />
          <a href="${article.link}">link</a>
          </br>
          <button class='toggle-saved' data-id='${article._id}' data-isSaved=${isSaved}>${toggleButtonText}</button>
          <button class='delete-button' data-id='${article._id}'>X</button>
          <button class=${button2Class} data-id='${article._id}' data-title='${article.title}'>${button2Text}</button>
        </div>`);
      };
    }

    if (data.unsaved.length > 0) {
      let section = '#articles';
      let toggleButtonText = 'SAVE';
      let button2Class = 'delete-button';
      let button2Text = 'X';
      let isSaved = false;

      $(`${section}`).append(`<button id="deleteScraped">CLEAR SCRAPED ARTICLES</button>
      `)
      for (let article of data.unsaved) {
        $(`${section}`).append(`
        <div class="individual-article">
          <a style="font-style: italic;" data-id='${article._id}'>${article.title}</a>
          <br />
          <a href="${article.link}">link</a>
          </br>
          <button class='toggle-saved' data-id='${article._id}' data-isSaved=${isSaved}>${toggleButtonText}</button>
          <button class=${button2Class} data-id='${article._id}'>${button2Text}</button>
        </div>`);
      }
    }
    // for (var i = 0; i < data.length; i++) {
    //   var section = '#saved';
    //   var toggleButtonText = 'UN-SAVE';
    //   var button2Class = 'notes-button';
    //   var button2Text = 'NOTES';
    //   var isSaved = true;

    //   if (data[i].isSaved === false) {
    //     section = '#articles';
    //     toggleButtonText = 'SAVE';
    //     button2Class = 'delete-button';
    //     button2Text = 'X';
    //     isSaved = false;

    //     $(`${section}`).append(`
    //       <div class="individual-article">
    //         <a style="font-style: italic;" data-id='${data[i]._id}'>${data[i].title}</a>
    //         <br />
    //         <a href="${data[i].link}">link</a>
    //         </br>
    //         <button class='toggle-saved' data-id='${data[i]._id}' data-isSaved=${isSaved}>${toggleButtonText}</button>
    //         <button class=${button2Class} data-id='${data[i]._id}'>${button2Text}</button>
    //       </div>`);
    //   } else {
    //     $(`${section}`).append(`
    //       <div class="individual-article">
    //         <a style="font-style: italic;" data-id='${data[i]._id}'>
    //           ${data[i].title}</a>
    //         <br />
    //         <a href="${data[i].link}">link</a>
    //         </br>
    //         <button class='toggle-saved' data-id='${data[i]._id}' data-isSaved=${isSaved}>${toggleButtonText}</button>
    //         <button class='delete-button' data-id='${data[i]._id}'>X</button>
    //         <button class=${button2Class} data-id='${data[i]._id}' data-title='${data[i].title}'>${button2Text}</button>
    //       </div>`);
    //   }
    // }
  });
}

// SCRAPE ARTICLES button
$('#scrape').click(function() {
  $.ajax({
    method: "GET",
    url: "/scrape",
    success: function () {
      renderArticles();
    }
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
      renderArticles();
      $('#notes').empty();
  });
});

$(document).on("click", ".delete-button", function() {
    var selected = $(this);
  $.ajax({
    type: "DELETE",
    url: "/delete/" + selected.attr("data-id"),
    success: function(response) {
      renderArticles();
      $('#notes').empty();
    }
  });
});

$(document).on("click", "#removeAll", function() {
  $.ajax({
    type: "DELETE",
    url: "/removeAll",

    success: function(response) {
      renderArticles();
    }
  })
})

$(document).on("click", "#deleteScraped", function() {
  $.ajax({
    type: "DELETE",
    url: "/deleteScraped",

    success: function(response) {
      renderArticles();
    }
  })
})

$(document).on("click", "#deleteSaved", function() {
  $.ajax({
    type: "DELETE",
    url: "/deleteSaved",

    success: function(response) {
      renderArticles();
    }
  })
})

$(document).on("click", ".notes-button", async function() {
  var selected = $(this);
  let id = selected.attr('data-id');
  const title = await getTitle(id);
  renderNotes(selected.attr('data-id'), title);
});

function renderNotes(articleId, title) {
  $.ajax({
    type: "GET",
    url: "/notes/" + articleId,

    success: function(response) {
      $('#notes').empty();
      if (response.length < 1) {
        $('#notes').append(`<div style='font-style: italic;'>"${title}"</div>`);
        $('#notes').append(`<div class="individual-article">no notes for this article</div>`);
      } else {
        $('#notes').append(`<button class="deleteNotes" article-id='${articleId}'>DELETE ARTICLE NOTES</button>`);
        $('#notes').append(`<div style='font-style: italic;'>"${title}"</div>`);

        for (var i = 0; i < response.length; i++) {
          $('#notes').append(`<div class="individual-article">${i + 1}. ${response[i].body}<br><button class='delete-note' data-id='${response[i]._id}' article-id='${articleId}'>X</button></div>`);
        } 
      }
      $('#notes').append(`<input placeholder="Write a note here..." class="notes-input"><br><button class="submit-note-button" data-id=${articleId}>submit</button>`);
    }
  });

}


// POST note
$(document).on("click", ".submit-note-button", async function() {
  var thisId = $(this).attr("data-id");
  const title = await getTitle(thisId);

  $.ajax({
    method: "POST",
    url: "/notes/" + thisId,
    data: {
      body: $(".notes-input").val(),
      article_id: thisId
    }
  }).then(function(data) {
      renderNotes(thisId, title);
    });
  $(".notes-input").val("");
});

// DELETE note
$(document).on("click", ".delete-note", async function() {
  var selected = $(this);
  var article = $(this).attr("article-id");
  const title = await getTitle(article);

  $.ajax({
    type: "DELETE",
    url: "/deleteNote/" + selected.attr("data-id"),
    success: function(response) {
      renderNotes(selected.attr('article-id'), title);
    }
  });
});

// DELETE article's notes
$(document).on("click", ".deleteNotes", async function() {
  var article = $(this).attr("article-id");
  const title = await getTitle(article);

  $.ajax({
    type: "DELETE",
    url: "/deleteNotes/" + article,

    success: function(response) {
      renderNotes(article, title);
    }
  })
})

// GET article title
async function getTitle(id) {
const title = await $.ajax({
    type: "GET",
    url: "/getTitle/" + id,
  })
  return title;
}

renderArticles();


});
