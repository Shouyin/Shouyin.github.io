var blurAddrSelect = document.getElementById("blurAddrSelect");
var ph = document.getElementById("ph");
var chooseButton = document.getElementById("chooseButton");

var httpRequest = new XMLHttpRequest();
var rstntString = '{"南岸": [{"name": "电车餐厅", "prices": "￥638", "type": "西餐", "blurAddr": "南岸", "actuAddr": "corner of Normanby Road and Clarendon Street, Melbourne, Victoria, 3205, Australia", "recommends": ["牛排", "巧克力蛋糕", "餐前小食"], "commentList": ["7.9", "9.0", "9.1"]}, {"name": "The Meat & Wine Co Restaurant(南岸店)", "prices": "￥284", "type": "牛排", "blurAddr": "南岸", "actuAddr": "Queensbridge Square/3 Queensbridge Street, Southbank 3006", "recommends": ["猪肋排", "牛肉眼牛排", "new York牛排"], "commentList": ["9.0", "9.1", "9.1"]}, {"name": "Waterfront Southgate", "prices": "￥411", "type": "海鲜", "blurAddr": "南岸", "actuAddr": "Southgate Avenue | Shop 20/3, Melbourne, Victoria 3006, Australia", "recommends": ["牛排", "海鲜饭", "海鲜拼盘"], "commentList": ["8.5", "9.1", "9.0"]}]}';

var rstntObj = {};

var currentChosen = []

var renderPage = (rstntString) => {
    rstntObj = JSON.parse(rstntString);
    for (let blurAddrs in rstntObj){
        let opt = document.createElement("option");
        opt.innerHTML = blurAddrs;
        opt.value = blurAddrs;
        blurAddrSelect.appendChild(opt);
    }
    
}

var changeChosen = (blurAddr) => {
    console.log(blurAddr);
    if (blurAddr in rstntObj){
        currentChosen = rstntObj[blurAddr];
    }
};

renderPage(rstntString);
blurAddrSelect.onchange = () => {
    changeChosen(blurAddrSelect.value);
};

chooseButton.onclick = () => {
    if (currentChosen.length != 0){
        randomIndex = Math.floor(Math.random() * currentChosen.length);
        console.log(randomIndex);
        ph.innerHTML = currentChosen[randomIndex]["name"];
    }
};


httpRequest.onreadystatechange = () => {
    rstntString = httpRequest.responseText;
    ph.innerHTML = rstntString;
};

httpRequest.open("GET", "restaurants.json", true);
httpRequest.send();