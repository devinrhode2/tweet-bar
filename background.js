// We'll merge omnibar api code and twitter code whenever
  //When installed, open a tab to authorize the app.
  if (localStorage.getItem('authorized') === null) {
    chrome.tabs.create({
      url: 'http://twitter.com/AUTHORIZE-DA-TWEET-BAR'
    });
  }
  
  
  
  //Post tweet
  chrome.omnibox.onInputEntered.addListener(function barListener(tweetText) {
      alert('attempting to tweet:' + tweetText);
    if (localStorage.getItem('authorized')) {
      alert('attempting to tweet2:' + tweetText);
    }
  });
  
  
  //Other random api code for potential use.
  chrome.omnibox.setDefaultSuggestion({
    description: 'desc',
  });
  
//Moving to no oauth, just hijacking page.
  console.log('asdf');