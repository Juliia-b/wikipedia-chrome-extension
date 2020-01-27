let showPopup,
    root = document.querySelector(':root'),
    res;

const myPopup = document.createElement('div');
myPopup.classList.add('popup');

const myArrow = document.createElement('div');
myArrow.classList.add('arrow');

//Сhannel with background.js to get the selected word
function GetText() {
    chrome.runtime.sendMessage({ click: "click" }, function(response) {
        res = response;
    })
}

document.addEventListener("dblclick", function(event) {

    let i = 0;

    let interval = setInterval(() => {
        GetText();
        i++
        if (i == 4) {
            DoAfterInterval(event);
            clearInterval(interval);
        }
    }, 15)

}, false);

document.addEventListener("click", function(event) {

    if (showPopup) {
        root.style.setProperty('--visibility', "hidden");
        showPopup = false;
    }

});

//Size and position of popup
function DoAfterInterval(event) {

    myPopup.innerHTML = '';

    let popupX = 340;
    let height = 220;
    let wordX = event.clientX;
    let wordY = event.clientY;
    let clickPageY = event.pageY;
    let pageX = document.documentElement.clientWidth;
    let pageY = document.documentElement.clientHeight;

    let size = getSize(popupX, wordX, wordY, pageX, pageY, height, clickPageY);

    root.style.setProperty('--x-of-word', size.wordX + 'px');
    root.style.setProperty('--y-of-word', size.wordY + 'px');
    root.style.setProperty('--left-from-arrow', size.leftFormArr + 'px');
    root.style.setProperty('--border-color', size.borderColor);
    root.style.setProperty('--top-popup', size.topPopup + 'px');
    root.style.setProperty('--popup-x', size.popupX + 'px');

    let selection = res.selected;

    if (selection.trim() !== '') {
        handleSubmit(selection, event);
        root.style.setProperty('--visibility', "visible");
        showPopup = true;
    }
}

function handleSubmit(input, event) {
    // prevent page from reloading when form is submitted
    event.preventDefault();

    // remove whitespace from the input
    const searchQuery = input.trim();

    // call `fetchResults` and pass it the `searchQuery`
    fetchResults(searchQuery);
}

function fetchResults(searchQuery) {

    let lan = GetLanguage(searchQuery);

    const endpoint = `https://${lan}.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            const results = data.query.search;
            displayResults(results, lan);
        })
        .catch(() => console.log('An error occurred'));
}

function displayResults(results, lan) {
    // Store a reference to `.searchResults`

    let str = ''

    // Loop over results array
    results.forEach(result => {
        const url = encodeURI(`https://${lan}.wikipedia.org/wiki/${result.title}`);

        str += `<div class="resultItem">
        <h3 class="resultItem-title">
        <a href="${url}" target="_blank" rel="noopener">${result.title}</a>
        </h3>
        <span class="resultItem-snippet">${result.snippet}</span><br>
        </div>
        <hr>
        `
    })

    // Text in the popup
    myPopup.innerHTML = `${str}`;

    const body = document.body;
    body.append(myPopup)
    body.append(myArrow)
}

function GetLanguage(text) {
    if (/[а-я]/i.test(text)) {
        return 'ru'
    } else if (/[a-z]/i.test(text)) {
        return 'en'
    }
}

function getSize(popupX, wordX, wordY, pageX, pageY, height, clickPageY) {
    /*Decreases the width of the popup while the browser window is wider*/
    while (popupX > (pageX - 10)) {
        popupX -= 2;
    }

    /*The minimum borders for the arrow*/
    if (wordX < 20) {
        wordX = 22;
    } else if ((pageX - wordX) < 20) {
        wordX = pageX - 22;
    }

    let leftFormArr;

    /*Popup positioning relative to the arrow*/
    if ((popupX / 2) <= (wordX - 6) && (popupX / 2) <= (pageX - wordX - 6)) {
        leftFormArr = wordX - popupX / 2
    } else if ((popupX / 2) > (pageX - wordX - 6)) {
        leftFormArr = wordX - (popupX - (pageX - wordX)) - 6
    }


    let borderColor,
        bottom,
        topPopup;

    /* If the popup does't fit at the bottom but fits at the top, 
     display up. Otherwise always display down */
    if (((height + 20) > (pageY - wordY)) && (height + 20) < wordY) {
        borderColor = '#555 transparent transparent transparent';
        wordY = wordY - 15 + (clickPageY - wordY); // Изменение wordY - 15;
        topPopup = wordY - 236;

    } else {
        borderColor = 'transparent transparent #555 transparent';
        wordY = wordY + 10 + (clickPageY - wordY); // Изменение wordY + 10 ;
        topPopup = wordY + 10;
    }

    return {
        popupX: popupX,
        leftFormArr: leftFormArr,
        wordX: wordX,
        borderColor: borderColor,
        wordY: wordY,
        topPopup: topPopup
    };
}