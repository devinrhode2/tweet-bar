(function backgroundJS() {
  'use strict';
  try {
  
    //globals:
    var tweet = false, authToken, postXhr;
    
    //Post tweet listener
    chrome.omnibox.onInputEntered.addListener(function barListener(tweetText) {
      if (twttr.txt.isValidTweetText(tweetText)) {
        tweet = tweetText;
        console.log('tweet:' + tweetText);
        console.log('requesting authToken...');
        
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
            postTweet(tweet, authToken, 'tweetEntered');
            xhr.abort();//abort once we have the authToken! Saves resources!
          }
        };
        xhr.send();
      } else {
        alert('tweet is invalid.. sorry! Please email me feedback at: DevinRhode2@gmail.com or tweet me @DevinRhode2 (but you\'re tweet is invalid soo.. you might want to use pastebin.com or something similar.)');
      }
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
    var postTweet = function postTweet(tweet /*string*/, authToken /*string*/, from /*string*/) {
      var mandate = function assertF(bool) {
        if (!bool) {
          throw new Error('arg error');
        }
      };
      mandate(typeof tweet  === 'string');
      mandate(tweet.length > 0);
      mandate(typeof authToken === 'string');
      mandate(authToken.length > 5);
      mandate(authToken.indexOf(' ') === -1);
      postXhr = new XMLHttpRequest();
      postXhr.open('POST', 'https://twitter.com/i/tweet/create', true);
      (function preserveTweetState(tweet) {
        postXhr.onreadystatechange = function XHROnReadyStateChange() {
          if (postXhr.readyState === 4) {
            var fromXhr = (from === 'xhr' ? ' (from xhr state)' : '');
            
            if (postXhr.status === 200) {
              var tweet_id = JSON.parse(postXhr.response).tweet_id;
              if (confirm('Successfully posted tweet' + fromXhr + '\n' +
                          '\n' +
                          'Enter to view tweet, esc to close')) {
                chrome.tabs.create({
                  'url': 'https://twitter.com/me/status/' + tweet_id
                });
              }
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
      }(tweet));
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
    alert(e.message);
  }
}());