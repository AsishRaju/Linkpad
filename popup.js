/***********************************************
  "Config and Init Methods"
***********************************************/
var DarkToggler = document.querySelector('.darkbtn');
var DarkMode = new DarkMode({ //--> DarkMode init
  light: "/css/light.css",
  dark: "/css/dark.css",
  saveOnToggle: true
});
darkBtnDOMChanges()

var mySwiper = new Swiper('.swiper-container', {  //--> Swiper.js init
  direction: 'horizontal',
  loop: false,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  preventClicks: false,
  keyboard: {
    enabled: true,
  },
})

const toastSOptions = { //--> Success toast config
  style: {
    main: {
      background: "var(--success)",
      color: "var(--white)",
    },
  },
  settings: {
    duration: 2000,
  },
};

const toastEOptions = { //--> Error toast config
  style: {
    main: {
      background: "var(--danger)",
      color: "var(--white)",
    },
  },
  settings: {
    duration: 2000,
  },
};

//--> Get saved data from background.js and assigning the response globally
chrome.runtime.sendMessage({ method: 'getContent', data: 'data' }, function (response) {  
  
  


  window.allLinkData = response
  loadSavedData(response)
});

/***********************************************
  "DOM Event Handlers"
***********************************************/

mySwiper.on('slideChange', () => { // --> Disable Buttons on last page
  if (mySwiper.isEnd) {
    document.getElementById('addLinkModalBtn').disabled = true
    document.getElementById('groupSettingModalBtn').disabled = true
  }
  else if(!mySwiper.isEnd) {
    document.getElementById('addLinkModalBtn').disabled = false
    document.getElementById('groupSettingModalBtn').disabled = false
  }

})

// --> Handlers for darkMode-btn,Link-delete-btn,single-click-open-url
let timer
var swipperBox = document.querySelector('.swiper-wrapper')
swipperBox.addEventListener('click', (e) => {   
  if (e.target.classList.contains('darkbtn')) {
    enableDarkMode()
  }
  else if (e.target.classList.contains('delete-btn')) {
    e.preventDefault()
    const eleRef=e.target.parentElement.parentElement
    const eleRef2=eleRef.parentElement.parentElement

    eleRef2.remove()
    const urlToDelete = eleRef.innerText.trim()

    window.allLinkData[mySwiper.realIndex].links.forEach((e, i) => {
      if (e.urltext === urlToDelete) {
        window.allLinkData[mySwiper.realIndex].links.splice(i, 1)
      }
    })

    saveChangedData()
  }
  else if (e.target.classList.contains('linkBody')) {
    e.preventDefault()
    if (e.detail === 1) {
      timer = setTimeout(() => {
        window.open(e.target.parentElement.href, '_blank');
      }, 200)
    }
  }
})


// --> Handlers for dbl-click-copy-url
swipperBox.addEventListener('dblclick', (e) => {
  if (e.target.classList.contains('linkBody')) {
    e.preventDefault()
    clearTimeout(timer)
    const urlCopy = `${e.target.parentElement.href}`;
    navigator.clipboard.writeText(urlCopy).then(function () {

      const toast = iqwerty.toast.toast(`${e.target.firstChild.nextSibling.innerText} Link Copied!`, toastSOptions);
    }, function (err) {
      const toast = iqwerty.toast.toast(`Some error occurred`, toastEOptions);
    });

  }
})

// --> Handlers for addLinkBtn inside #addLinkModal
document.getElementById('addLinkBtn').addEventListener('click', (e) => {
  const url = document.getElementById('url').value
  const urltext = document.getElementById('urltext').value
  $('#addLinkModal').modal('hide')
  addLinkListItem(url, urltext)
})



// --> Handlers for addGroupBtn inside #groupSettingModal
document.getElementById('addGroupBtn').addEventListener('click', () => {
  var newGroupName = document.getElementById('addGroupInput').value
  const newSlide = `<div class="swiper-slide">
  <h4><span class="text-monospace badge badge-primary my-2 slide-title">${newGroupName}</span></h4>
  <ul class="list-group todos mx-2 text-light"></ul>
  </div>`
  mySwiper.addSlide((mySwiper.slides.length) - 1, newSlide)
  $('#groupSettingModal').modal('hide')
  mySwiper.slideTo((mySwiper.slides.length) - 2)
  newGroupName.value = ''
  const index = mySwiper.realIndex
  saveGroup(index, newGroupName, window.allLinkData)
})


// --> Handlers for addGroupBtn inside #groupSettingModal
document.getElementById('removeGroupBtn').addEventListener('click', () => {
  mySwiper.removeSlide(mySwiper.activeIndex);
  Object.keys(allLinkData).forEach((e,i)=>{
    if(i===mySwiper.activeIndex)
    {
      delete window.allLinkData[e]
    }
  })
  $('#groupSettingModal').modal('hide')
  mySwiper.slidePrev();
  saveChangedData()
})


/***********************************************
  "Core Logic Functions"
***********************************************/


function darkBtnDOMChanges() {
  if (DarkMode.getMode() === 'dark') {
    DarkToggler.innerText = '🌞 Mode'
  }
  else {
    DarkToggler.innerText = '🌙 Mode'
  }
}

function enableDarkMode() {
  DarkMode.toggleMode()
  darkBtnDOMChanges()
}

function loadSavedData(response) {
  
  Object.keys(response).forEach((e, i) => {
    var listHtml=''
    var newSlide=''

    response[e].links.forEach((e) => {
      listHtml += `<div class="link-item mb-2">
      <a href="${e.url}" target="_blank" class="list-group-item list-group-item-action py-2 px-2">
          <div class="d-flex w-100 linkBody justify-content-between">
              <h6 class="link-title font-weight-bold" style="font-size: 20px;">${e.urltext}</h6>
              <span>
              <img src="./css/times-solid.svg" class="delete-btn">
              </span>
          </div>
      </a>
      </div>`
    })

    newSlide = `<div class="swiper-slide">
  <h4><span class="text-monospace badge badge-primary my-2 slide-title">${response[e].title}</span></h4>
  <ul class="list-group todos mx-2 text-light">${listHtml}</ul>
  </div>`
    if (i === 0) {
      mySwiper.prependSlide(newSlide)
    }
    else {
      mySwiper.addSlide((mySwiper.slides.length) - 1, newSlide)
    }
    mySwiper.slideTo(0)
  })
}

function addLinkListItem(url, urltext) {
  const index = (mySwiper.realIndex).toString()
  const activePage = document.querySelector('.swiper-slide-active').childNodes[3]
  var listHtml = `<div class="link-item mb-2">
  <a href="${url}" target="_blank" class="list-group-item list-group-item-action py-2 px-2">
      <div class="d-flex w-100 linkBody justify-content-between">
          <h5 class="link-title font-weight-bold" style="font-size: 20px;">${urltext}</h5>
          <span>
          <img src="./css/times-solid.svg" class="delete-btn">
          </span>
      </div>
  </a>
  </div>`
  activePage.innerHTML += listHtml
  saveLinkListItem(index, url, urltext, window.allLinkData)
}

function saveLinkListItem(index, url, urltext, allLinkData) {
  const newLinkObj = {
    "urltext": `${urltext}`,
    "url": `${url}`
  }
  allLinkData[index].links.push(newLinkObj) 
  saveChangedData()
  
}

function saveGroup(index, newGroupName, allLinkData) {
  const newGroupObj = {
    "title": `${newGroupName}`,
    "links": []
  }
  allLinkData[index] = newGroupObj
  saveChangedData()
}

function saveChangedData()
{
  chrome.runtime.sendMessage({ method: 'saveData', data: window.allLinkData }, function (response) {

  });
}