/***********************************************
  
    Background.js is initiated when chrome browser is launched , 
    this allows popup.js to load saved data faster because Background.js retrives the data from
    the chrome local storage at the start of the chrome , not when extension is enabled.

    If this approach have not been used there would be a performance hits and noticeable load time ,

    Hail Chrome API's !!


***********************************************/

var allLinkDataDefault = { //--> Deafult Object where allLinkData will be stored
    0: {
      "title": "Social Media",
      "links": [
  
      ]
    }
  }

chrome.runtime.onMessage.addListener(callback); //--> Chrome Message Listener init
function callback(obj, sender, sendResponse) {
    if (obj) {
        if (obj.method == 'getContent') {   //--> when popup ask for savedData
            getContent(sendResponse);
            
        } else if (obj.method == 'saveData') { //--> when popup ask's to save data
            chrome.storage.sync.clear()
            chrome.storage.sync.set({'linkpad': obj.data}, function() {
                    sendResponse('New Data is set ✔');
            });
        }
    }
    return true; 
}


function getContent(sendResponse) { //--> response callBack 
    chrome.storage.sync.get(['linkpad'], function(result) { //--> asking chrome to return the saved data
        if(jQuery.isEmptyObject(result))
        {
            sendResponse(allLinkDataDefault)
        }
        else
        {
            sendResponse(result.linkpad)
        }
      });
}