'use strict';

var addCommentPanelObj, addCommentCancelBtnObj, addCommentPublishBtnObj, addCommentBtnObj, commentTextObj;
var commentsPanelObj, addCommentErrorLogObj, commentsPrevObj, commentsNextObj, commentsPageObj;
var addCommentErrorLogTextObj, commentsPageTextObj;

var commentSelection = {
  owner: null,
  expanded: null,
  response: null
}

var projectId = null;
var mapLocation = null;
var commentsPage = 0;

function init(id, lat, lon) {
  projectId = id;
  initElements();
  loadComments(commentsPage);
  mapLocation = { lat: lat,
                  lon: lon };
  loadGoogleMaps();
}

function initElements() {
  commentsPanelObj = document.getElementById('comments_panel');

  commentTextObj = document.getElementById('comment_text');
  addCommentPanelObj = document.getElementById('add_comment_panel');

  addCommentBtnObj = document.getElementById('add_comment_btn');
  addCommentBtnObj.addEventListener('click', function(evt) { showAddComment(); });

  addCommentCancelBtnObj = document.getElementById('add_comment_cancel_btn');
  addCommentCancelBtnObj.addEventListener('click', function(evt) { hideAddComment(); });

  addCommentPublishBtnObj = document.getElementById('add_comment_publish_btn');
  addCommentPublishBtnObj.addEventListener('click', function(evt) { publishComment(); });

  addCommentErrorLogObj = document.getElementById('error-log');
  addCommentErrorLogTextObj = document.createTextNode('');
  addCommentErrorLogObj.appendChild(addCommentErrorLogTextObj);

  commentTextObj.addEventListener('focus', function(evt) { clearPublishErrorLog(); });

  commentsPrevObj = document.getElementById('comments_previous');
  commentsPrevObj.addEventListener('click', function(evt) { goToPage(-1); });
  commentsNextObj = document.getElementById('comments_next');
  commentsNextObj.addEventListener('click', function(evt) { goToPage(1); });
  
  commentsPageObj = document.getElementById('comments_current_page');
  commentsPageTextObj = document.createTextNode('');
  commentsPageObj.appendChild(commentsPageTextObj);
}

function showAddComment() {
  if (commentSelection.expanded) {
    commentSelection.expanded.click();
    commentSelection.expanded = null;
  }

  if (commentSelection.response) {
    commentSelection.response.parentNode.removeChild(commentSelection.response);
    commentSelection.response = null;
  }

  addCommentBtnObj.style.display = 'none';
  addCommentPanelObj.style.display = 'block';
  commentTextObj.focus();
}

function hideAddComment() {
  addCommentBtnObj.style.display = 'inline-block';
  addCommentPanelObj.style.display = 'none';
  commentTextObj.value = '';
}

function onPublishValidationError(element, error) {
  addCommentErrorLogObj.classList.remove('text_fade_in');
  addCommentErrorLogObj.offsetWidth;
  addCommentErrorLogObj.classList.add('text_fade_in');
  addCommentErrorLogTextObj.nodeValue = 'No has introducido un comentario. ' + error;
}

function publishComment() {
  clearPublishErrorLog();

  InputHelper.clearValidator();
  var text = InputHelper.validate(commentTextObj, { required: true, length: [1, 1000] }, onPublishValidationError);
  
  if (InputHelper.validationErrors()) {
    return;
  }

  sendComment(text, null, function(error, msg) {
    if (error) {
      addCommentErrorLogObj.classList.remove('text_fade_in');
      addCommentErrorLogObj.offsetWidth;
      addCommentErrorLogObj.classList.add('text_fade_in');
      addCommentErrorLogTextObj.nodeValue = 'No se ha podido enviar tu comentario, intentalo mas tarde';
      return;
    }

    hideAddComment();
    commentsPage = 0;
    loadComments(commentsPage);
  });
}

function clearPublishErrorLog() {
  addCommentErrorLogTextObj.nodeValue = '';
}

function goToPage(next) {
  commentsPage += next;
  loadComments(commentsPage);
}

function loadComments(page, callback) {
  var url = 'api/comments/' + projectId + '/' + page;
  HttpClient.sendRequest(url, 'GET', null, function(status, statusText, response) {
    if (status == 200) {
      showComments(response.comments, response.pages);
      if (callback) callback();
    } else {
      onLoadCommentsError(status);
    }
  });
}

function sendComment(text, threadId, callback) {
  var comment = {
    projectId: projectId,
    text: text
  };

  if (threadId) comment.threadId = threadId;

  HttpClient.sendRequest('api/comment', 'POST', comment, function(status, statusText, response) {
    if (status == 200) {
      callback(null, response);
      return;
    }

    callback(status, null);
  });
}

function updateControls(pages) {
  if (pages > 1 && commentsPage + 1 < pages) {
    commentsNextObj.style.visibility = 'visible';
  } else {
    commentsNextObj.style.visibility = 'hidden';
  }

  if (commentsPage > 0) {
    commentsPrevObj.style.visibility = 'visible';
  } else {
    commentsPrevObj.style.visibility = 'hidden';
  }

  if (pages > 1) {
    commentsPageTextObj.nodeValue = commentsPage + 1;
    commentsPageObj.style.visibility = 'visible';
  }
}

function onLoadCommentsError(error) {
  while (commentsPanelObj.firstChild) {
    commentsPanelObj.removeChild(commentsPanelObj.firstChild);
  }

  var p = document.createElement('p');
  p.appendChild(document.createTextNode('No se han podido cargar los comentarios.'));
  p.classList.add('comments_error');
  commentsPanelObj.appendChild(p);
}

function showComments(comments, pages) {
  while (commentsPanelObj.firstChild) {
    commentsPanelObj.removeChild(commentsPanelObj.firstChild);
  }

  updateControls(pages);

  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i];
    var parent = comment.comments[0];
    var childComments = comment.comments.slice(1, comment.comments.length);

    var thread = document.createElement('div');
    var parentDiv = document.createElement('div');
    parentDiv.classList.add('comment_parent');
    thread.appendChild(parentDiv);

    var user = document.createElement('p');
    user.appendChild(document.createTextNode(parent.user.name));

    var date = document.createElement('p');
    date.classList.add('comment_date');
    date.appendChild(document.createTextNode(formatDate(new Date(parent.date))));

    var text = document.createElement('p');
    text.appendChild(document.createTextNode(parent.text));
    text.classList.add('comment_text');

    var img = document.createElement('img');
    img.src = '/images/max_light.png';
    img.classList.add('right', 'pointer');

    var response = document.createElement('p');
    response.appendChild(document.createTextNode('Responder'));
    response.classList.add('comment_response');
    response.onclick = (function() {
      var div = thread;
      var id = comment.threadId;
      var expand = img;
      return function() {
        handleResponseClick(div, id, expand);
      }
    })();
    
    parentDiv.appendChild(img);
    parentDiv.appendChild(response);
    parentDiv.appendChild(date);
    parentDiv.appendChild(user);

    parentDiv.appendChild(text);

    var childsDiv = document.createElement('div');
    childsDiv.classList.add('childs_container');
    childsDiv.style.display = 'none';
    thread.appendChild(childsDiv);

    if (childComments.length > 0) {
      renderChilds(thread, childsDiv, comment.threadId, childComments, img);
    } else {
      img.style.visibility = 'hidden';
    }

    img.onclick = (function() {
      var content = childsDiv;
      var expanded = false;
      var image = img;
      var threadDiv = thread;
      return function() {
        expanded = handleExpandClick(expanded, threadDiv, content, image);
      }
    })();

    commentsPanelObj.appendChild(thread);
  }
}

function formatDate(date) {
  var dateStr = ('0' + date.getDate()).slice(-2) + '/' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();

  var timeStr = ('0' + date.getHours()).slice(-2) + ':' +
    ('0' + date.getMinutes()).slice(-2) + ':' +
    ('0' + date.getSeconds()).slice(-2);

  return dateStr + ' ' + timeStr;
}

function renderChilds(threadDiv, childsDiv, threadId, childComments, img) {
  for (var i = 0; i < childComments.length; i++) {
    var comment = createComment(childComments[i], threadDiv, threadId, img);
    childsDiv.appendChild(comment);
  }
}

function createComment(comment, threadDiv, threadId, img) {
  var div = document.createElement('div');
  div.classList.add('comment_child');

  var user = document.createElement('p');
  user.appendChild(document.createTextNode(comment.user.name));

  var date = document.createElement('p');
  date.classList.add('comment_date');
  date.appendChild(document.createTextNode(formatDate(new Date(comment.date))));

  var text = document.createElement('p');
  text.appendChild(document.createTextNode(comment.text));
  text.classList.add('comment_text');

  var response = document.createElement('p');
  response.appendChild(document.createTextNode('Responder'));
  response.classList.add('comment_response');
  response.onclick = (function() {
    var div = threadDiv;
    var id = threadId;
    var image = img;
    return function() {
      handleResponseClick(div, id, image);
    }
  })();

  div.appendChild(response);
  div.appendChild(date);
  div.appendChild(user);
  div.appendChild(text);

  return div;
}

function appendChildComment(comment, threadDiv, threadId, img) {
  var childs = threadDiv.childNodes[1];
  var commentObj = createComment(comment, threadDiv, threadId, img);
  childs.appendChild(commentObj);

  if (childs.childNodes.length == 1) {
    img.style.visibility = 'visible';
    img.click();
  }
}

function onThreadPublishValidationError(errorTextObj, element, error, errorType) {
  this.classList.remove('text_fade_in');
  this.offsetWidth;
  this.classList.add('text_fade_in');
  var errorMsg = 'error';
  if (errorType == 'required') {
    errorMsg = 'No has intoducido un comentario. ' + error;
  } else if (errorType == 'length') {
    errorMsg = 'Comentario demasiado largo. ' + error;
  }
  errorTextObj.nodeValue = errorMsg;
}

function createCommentInput(threadId, threadDiv, expandObj) {
  var panel = document.createElement('div');
  panel.classList.add('comment_input');

  var errorLog = document.createElement('p');
  var errorLogText = document.createTextNode('');
  errorLog.appendChild(errorLogText);
  errorLog.classList.add('comment-error');

  var textInput = document.createElement('textarea');
  textInput.rows = 4;
  textInput.cols = 50;
  textInput.maxLength = 1000;
  textInput.onfocus = (function() {
    var logText = errorLogText;
    return function() {
      logText.nodeValue = '';
    }
  })();

  var cancelContainer = document.createElement('div');
  cancelContainer.classList.add('left');
  var cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.classList.add('button');
  cancelBtn.appendChild(document.createTextNode('Cancelar'));
  cancelBtn.onclick = (function() {
    return function() {
      if (commentSelection.response) {
        commentSelection.response.parentNode.removeChild(commentSelection.response);
        commentSelection.response = null;
      }
    }
  })();
  cancelContainer.appendChild(cancelBtn);

  var sendContainer = document.createElement('div');
  sendContainer.classList.add('right');
  var sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.classList.add('button');
  sendBtn.appendChild(document.createTextNode('Responder'));
  sendBtn.onclick = (function() {
    var input = textInput;
    var log = errorLog;
    var logText = errorLogText;
    var id = threadId;
    var container = threadDiv;
    var img = expandObj;
    return function() {

      var send = function() {
        logText.nodeValue = '';

        InputHelper.clearValidator();
        var text = InputHelper.validate(input, { required: true, length: [1, 1000]}, onThreadPublishValidationError.bind(log, logText));
    
        if (InputHelper.validationErrors()) {
          return;
        }

        sendComment(text, id, function(error, msg) {
          if (error == 404) {
            log.classList.remove('text_fade_in');
            log.offsetWidth;
            log.classList.add('text_fade_in');
            logText.nodeValue = 'Estás respondiendo a un comentario que ya no existe, recarga la página.';
            return;
          }

          if (error) {
            log.classList.remove('text_fade_in');
            log.offsetWidth;
            log.classList.add('text_fade_in');
            logText.nodeValue = 'No se ha podido enviar tu comentario, intentalo mas tarde';
            return;
          }

          if (commentSelection.response) {
            commentSelection.response.parentNode.removeChild(commentSelection.response);
            commentSelection.response = null;
          }

          appendChildComment(msg, container, id, img);
        });
      }

      send();
    }
  })();
  sendContainer.appendChild(sendBtn);

  var inputPanel = document.createElement('div');
  inputPanel.classList.add('form_double_field');
  inputPanel.appendChild(cancelContainer);
  inputPanel.appendChild(sendContainer);

  var clear = document.createElement('p');
  clear.classList.add('clear');

  panel.appendChild(textInput);
  panel.appendChild(errorLog);
  panel.appendChild(inputPanel);
  panel.appendChild(clear);

  return panel;
}

function handleExpandClick(expanded, threadDiv, childsDiv, image) {
  if (expanded) {
    childsDiv.style.display = 'none';
    image.src = '/images/max_light.png';
    
    commentSelection.expanded = null;
    if (commentSelection.response) {
      commentSelection.response.parentNode.removeChild(commentSelection.response);
      commentSelection.response = null;
    }

    commentSelection.owner = null;
    return false;
  }

  if (commentSelection.owner != threadDiv) {
    if (commentSelection.expanded) {
      commentSelection.expanded.click();
    }

    if (commentSelection.response) {
      commentSelection.response.parentNode.removeChild(commentSelection.response);
      commentSelection.response = null;
    }
  }

  commentSelection.owner = threadDiv;
  commentSelection.expanded = image;

  childsDiv.style.display = 'block';
  image.src = '/images/min_light.png';

  return true;
}

function handleResponseClick(threadDiv, threadId, expandObj) {
  if (commentSelection.response && commentSelection.owner == threadDiv) {
    commentSelection.response.firstChild.focus();
    return;
  }

  if (commentSelection.owner != threadDiv) {
    if (commentSelection.expanded) {
      commentSelection.expanded.click();
      commentSelection.expanded = null;
    }

    if (commentSelection.response) {
      commentSelection.response.parentNode.removeChild(commentSelection.response);
      commentSelection.response = null;
    }
  }

  hideAddComment();
  
  commentSelection.owner = threadDiv;

  if (expandObj.style.visibility != 'hidden' && commentSelection.expanded != expandObj) {
    expandObj.click();
    commentSelection.expanded = expandObj;
  }

  commentSelection.response = createCommentInput(threadId, threadDiv, expandObj);
  threadDiv.appendChild(commentSelection.response);
  commentSelection.response.firstChild.focus();
}

function loadGoogleMaps() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://maps.googleapis.com/maps/api/js?callback=onGoogleMapsReady&language=es';
  var x = document.getElementsByTagName('script')[0];
  x.parentNode.insertBefore(script, x);
}

function onGoogleMapsReady() {
  var mapCanvas = document.getElementById('map');
  var coordinates = new google.maps.LatLng(mapLocation.lat, mapLocation.lon);
  var mapOptions = {
    center: coordinates,
    zoom: 15,
    scrollwheel: false,
  }
  var map = new google.maps.Map(mapCanvas, mapOptions);
  var marker = new google.maps.Marker({
    position: coordinates,
    map: map
  });
}
