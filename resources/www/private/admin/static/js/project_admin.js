'use strict';

function loadComments(page, callback) {
  var url = '/admin/comments/' + projectId + '/' + page;
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

  HttpClient.sendRequest('/admin/comment', 'POST', comment, function(status, statusText, response) {
    if (status == 200) {
      callback(null, response);
      return;
    }

    callback(status, null);
  });
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

    var del = document.createElement('img');
  	del.src = '/images/del_light.png';
  	del.style.float = 'right';
  	del.style.marginLeft = '10px';
  	del.style.cursor = 'pointer';
  	del.onclick = (function() {
      var threadId = comment.threadId;
      return function() {
        if (confirm('Estás seguro que quieres eliminar el hilo de comentarios?') == true) {
      	  deleteThread(threadId);
        }
      }
    })();

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
    
    parentDiv.appendChild(del);
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

  var del = document.createElement('img');
  del.src = '/images/del.png';
  del.style.float = 'right';
  del.style.cursor = 'pointer';
  del.onclick = (function() {
    var parentId = threadId;
    var msgId = comment._id;
    return function() {
      if (confirm('Estás seguro que quieres eliminar el comentario?') == true) {
    	  deleteThreadChild(parentId, msgId);
      }
    }
  })();

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

  div.appendChild(del);
  div.appendChild(response);
  div.appendChild(date);
  div.appendChild(user);
  div.appendChild(text);

  return div;
}

function deleteThread(threadId) {
	var url = '/admin/comment/' + projectId + '/' + threadId;
	HttpClient.sendRequest(url, 'DELETE', null, function(status, statusText, response) {
  	if (status == 200) {
    	loadComments(commentsPage);
  	} else {
      if (status == 401) {
        loginPopup(function() {
          deleteThread(threadId);
        });
        return;
      }
    	alert('No se ha podido borrar el hilo de comentarios');
  	}
	});
}

function deleteThreadChild(threadId, msgId) {
	var url = '/admin/comment/' + projectId + '/' + threadId + '/' + msgId;
	HttpClient.sendRequest(url, 'DELETE', null, function(status, statusText, response) {
  	if (status == 200) {
    	loadComments(commentsPage);
  	} else {
      if (status == 401) {
        loginPopup(function() {
          deleteThreadChild(threadId, msgId);
        });
        return;
      }
    	alert('No se ha podido borrar el comentario');
  	}
	});
}

HttpClient.loginRequest = function(errorObj, params, callback) {
  this.sendRequest('/admin/session', 'POST', params, function(status, statusText, response) {
    HttpClient.processLoginResponse(status, statusText, response, errorObj, callback);
  }, true);
};
