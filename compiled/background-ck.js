(function backgroundJS(){
  'use strict';
  try {
    String.prototype.contains = function contains(string) {
      return this.indexOf(string) > -1;
    };
    
    //globals:
    var tweet, authToken, postXhr, fail;
    
    
    var validTweet = function validTweet(tweetText) {
      tweetText = tweetText.trim();
      /*
      if (tweetText.contains(' http://') || tweetText.contains(' https://')) {
        if () {
          
        }
      }
      */
      var len = tweetText.length;
      if (len < 140 && len > 0) {
        return true;
      } else {
        return false;
      }
    };
    
    //Post tweet listener
    chrome.omnibox.onInputEntered.addListener(function barListener(tweetText) {
      if (validTweet(tweetText)) {
        tweet = tweetText;
        if (authToken) postTweet(tweet, authToken, 'tweetEntered');
        console.log('tweet:' + tweetText);
      }
    });
    
  /*
      //some of twitter's url handling code
      var b = this.val();
      a = b.length, this.hasMedia && (a += c + 1);
      var e = d.extractUrls(b), f = e.join("");
      a -= f.length, a += e.length * c;
      var g = f.match(/https:/g);
      return a += g ? g.length : 0, a
  */
    
    //Other random api code for potential use.
    var defaultSuggestion = 'Tweet: %s';
      chrome.omnibox.setDefaultSuggestion({
      description: defaultSuggestion
    });
 
    
    //when input starts, go get an authenticity_token
    chrome.omnibox.onInputStarted.addListener(function inputStarted() {
      
      // Bare bones XHR because we don't need the whole response.
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://twitter.com', true);
      xhr.onreadystatechange = function ManualReadyStateChange() {
        var box, resp = xhr.responseText; //box is multipurpose variable, which saves _some_ memory
        if (resp) box = resp.indexOf('name="authenticity_token"');
        
        //Once we have the authenticy token we're done.
        if(resp && box > -1) {
          box = resp.substring(0, box);
          var start = box.lastIndexOf('value="') + 7;
          var end = box.lastIndexOf('"');
          authToken = box.substring(start, end);
          console.log('authToken:'+authToken);
          if (tweet) postTweet(tweet, authToken, 'xhr');
          xhr.abort();//abort once we have the authToken! Saves resources!
        }
      };
      xhr.send();
    });
    
    chrome.omnibox.onInputChanged.addListener(function inputChanged(textString, returnSuggestion) {
      if (textString.length > 100) {
        chrome.omnibox.setDefaultSuggestion({
          description: 'Tweet (' + textString.length + '): %s'
        });
      } else {
        chrome.omnibox.setDefaultSuggestion({
          description: defaultSuggestion
        });
      }
    });
      
    //Mmmm fuck oauth!
    var postTweet = function postTweet(tweet, authToken) {
      postXhr = new XMLHttpRequest();
      postXhr.open('POST', 'https://twitter.com/i/tweet/create', true);
      postXhr.onreadystatechange = function XHROnReadyStateChange() {
        if(postXhr.readyState === 4) {
          alert('Posted tweet: '+tweet);
          postXhr.abort();
          postXhr = undefined;
        }
      };
      postXhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      postXhr.send(
        'status=' + encodeURIComponent( tweet ).replace(/%20/g, '+') + 
        '&place_id=&authenticity_token=' + authToken
      );
      //including place_id so it looks more like a legitimate post
      //from twitter.com. (place_id is included in the post data)
      tweet = undefined;
    };
    chrome.omnibox.onInputCancelled.addListener(function() {
      tweet = undefined;
      if (postXhr) postXhr.abort();
    });
    
    console.log('loaded');
  } catch (e) {
    fail = function fail(message) {
      alert(message);
      throw new Error(message);
    };
    
    if ()
    console.error('lastError:'+(chrome.runtime.lastError ? chrome.runtime.lastError.message : '' ));
    console.error('lastError object:', chrome.runtime.lastError);
    throw e;
  }
})();