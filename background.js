(function littleLib(){
  //From github.com/devinrhode2/extension-include
  var ajaxSend = function ajaxSend(url, callback, method, args) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.onreadystatechange = function XHROnReadyStateChange() {
      if(xhr.readyState === 4) {
        callback(xhr.responseText, xhr);
      }
    };
    if(method === 'POST') {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    xhr.send(args);
  };
  
  /**
   * POST
   * Basic POST ajax request
   * POST(url, function(responseString){}, 'ar1=2&arg2=3');
   */
  POST = function POST(url, callback,         args) {
              ajaxSend(url, callback, 'POST', args);
  };
})();

(function backgroundJS(){
  'use strict';
  try {
    //globals:
    var tweet, authToken;
    
    var validTweet = function validTweet(tweetText) {
      tweetText = tweetText.trim();
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
        console.log('tweet');
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
      console.log(xhr);
      console.dir(xhr);
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
      console.log('postTweet:',arguments);
        POST('https://twitter.com/i/tweet/create', function postTweetResponse(){
          console.log('post resp', arguments);
        },'status=' + tweet + '&place_id=&authenticity_token=' + authToken);
      tweet = false;
      alert('Posted tweet');
    };
    
    console.log('loaded');
  } catch (e) {
    console.error('lastError:'+(chrome.runtime.lastError ? chrome.runtime.lastError.message : '' ));
    console.error('lastError object:', chrome.runtime.lastError);
    throw e;
  }
})();