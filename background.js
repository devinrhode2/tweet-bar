;(function backgroundJS() {
  'use strict';
  try {
  
    //globals:
    var tweet = false, authToken, postXhr;
    
    //Post tweet listener
    chrome.omnibox.onInputEntered.addListener(function barListener(tweetText) {
      if (twttr.txt.isValidTweetText(tweetText)) {
        tweet = tweetText;
        if (authToken) {
          postTweet(tweet, authToken, 'tweetEntered');
        }
        console.log('tweet:' + tweetText);
      }
    });
    
    //when input starts, go get an authenticity_token
    chrome.omnibox.onInputStarted.addListener(function inputStarted() {
      console.log('onInputStarted, requesting authToken');
      
      // Bare bones XHR because we don't need the whole response.
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://twitter.com', true);
      xhr.onreadystatechange = function ManualReadyStateChange() {
        var box, resp = xhr.responseText; //box is multipurpose variable, which saves _some_ memory
        if (resp) {
          box = resp.indexOf('name="authenticity_token"');
        }
        
        //Once we have the authenticy token we're done.
        if (resp && box > -1) {
          box = resp.substring(0, box);
          var start = box.lastIndexOf('value="') + 7;
          var end = box.lastIndexOf('"');
          authToken = box.substring(start, end);
          if (authToken.indexOf(' ') > -1) {
            throw new Error('authToken is clearly invalid, it contains spaces.');
          }
          console.log('authToken:' + authToken);
          if (tweet) {
            postTweet(tweet, authToken, 'xhr');
          }
          xhr.abort();//abort once we have the authToken! Saves resources!
        }
      };
      xhr.send();
    });
    
    
    //Character counter/suggestion text.
    var defaultSuggestion = 'Tweet: %s';
    chrome.omnibox.setDefaultSuggestion({
      description: defaultSuggestion
    });
    chrome.omnibox.onInputChanged.addListener(function inputChanged(textString/* , returnSuggestion */) {
      if (textString.length > 100) {
        var realLength = twttr.txt.getTweetLength(textString);
        if (realLength > 140) {
          chrome.omnibox.setDefaultSuggestion({
            description: 'Tweet (' + realLength + '): TWEET TOO LONG'
          });
        } else {
          chrome.omnibox.setDefaultSuggestion({
            description: 'Tweet (' + realLength + '): %s (' + realLength + ')'
          });
        }
      } else {
        chrome.omnibox.setDefaultSuggestion({
          description: defaultSuggestion
        });
      }
    });
      
    //Mmmm fuck oauth!
    var postTweet = function postTweet(tweet, authToken, from) {
      console.assert(typeof tweet === 'string');
      console.assert(tweet.length > 0);
      console.assert(typeof authToken === 'string');
      console.assert(authToken.length > 5);
      console.assert(authToken.indexOf(' ') === -1);
      postXhr = new XMLHttpRequest();
      postXhr.open('POST', 'https://twitter.com/i/tweet/create', true);
      postXhr.onreadystatechange = function XHROnReadyStateChange() {
        if (postXhr.readyState === 4) {
          var fromXhr = (from === 'xhr' ? ' (from xhr state)' : '');
          
          if (postXhr.status === 200) {
            alert('Successfully posted tweet' + fromXhr);
          } else {
            (function potentialOptimization() { //Perhaps this closure helps memory.. I dunno
              
              var copySuccessful = true;
              try {
                //Hate this code.. but it works!
                var copyDiv = document.createElement('div');
                copyDiv.contentEditable = true;
                document.body.appendChild(copyDiv);
                copyDiv.innerHTML = tweet;
                copyDiv.unselectable = 'off';
                copyDiv.focus();
                document.execCommand('SelectAll');
                document.execCommand('Copy', false, null);
                document.body.removeChild(copyDiv);
                
                copySuccessful = false;
                alert('Your tweet failed to post, so we copied it to your clipboard.' + fromXhr);
              } catch ( _ ) { }
              chrome.tabs.create({
                'url': 'https://twitter.com/' +  (copySuccessful ? '' : '#' + tweet)
              });
              
            }());
          }
          postXhr.abort(); //dont waste users bandwidth!
          postXhr = null;
        }
      };
      postXhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      postXhr.send('status=' + tweet + '&place_id=&authenticity_token=' + authToken); //including place_id so it looks more like a legitimate post
      //(on twitter.com, place_id is included in the post data
      tweet = false;
    };
    
    chrome.omnibox.onInputCancelled.addListener(function inputCancelled() {
      tweet = false;
      if (postXhr) {
        postXhr.abort();
      }
    });
    
    console.log('loaded');
  } catch (e) {
    alert('lastError:' + (chrome.runtime.lastError ? chrome.runtime.lastError.message : ''));
    console.error('lastError object:', chrome.runtime.lastError);
    throw e;
  }
}());