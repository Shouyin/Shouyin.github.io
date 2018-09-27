var blurAddrSelect = document.getElementById("blurAddrSelect");
var ph = document.getElementById("ph");
var chooseButton = document.getElementById("chooseButton");
var result = document.getElementById("resulttag");
var details = document.getElementById("details");
var pricetag = document.getElementById("pricetag");
var comments = document.getElementById("comments");
var actuAddrs = document.getElementById("actuAddrs");

var httpRequest = new XMLHttpRequest();
var rstntString = '{"南岸": [{"name": "电车餐厅", "prices": "￥638", "type": "西餐", "blurAddr": "南岸", "actuAddr": "corner of Normanby Road and Clarendon Street, Melbourne, Victoria, 3205, Australia", "recommends": ["牛排", "巧克力蛋糕", "餐前小食"], "commentList": ["7.9", "9.0", "9.1"]}, {"name": "The Meat & Wine Co Restaurant(南岸店)", "prices": "￥284", "type": "牛排", "blurAddr": "南岸", "actuAddr": "Queensbridge Square/3 Queensbridge Street, Southbank 3006", "recommends": ["猪肋排", "牛肉眼牛排", "new York牛排"], "commentList": ["9.0", "9.1", "9.1"]}, {"name": "Waterfront Southgate", "prices": "￥411", "type": "海鲜", "blurAddr": "南岸", "actuAddr": "Southgate Avenue | Shop 20/3, Melbourne, Victoria 3006, Australia", "recommends": ["牛排", "海鲜饭", "海鲜拼盘"], "commentList": ["8.5", "9.1", "9.0"]}]}';

var rstntObj = {};

var currentChosen = [];
var chosenRant = {};

var flashing = null;
var count = 0;

var MAX_FLASH = 5;

var renderPage = (rstntString) => {
    rstntObj = JSON.parse(rstntString);
    console.log(rstntObj);
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

blurAddrSelect.onchange = () => {
    changeChosen(blurAddrSelect.value);
};

var randomChanging = () => {
    if (currentChosen.length != 0){
        randomIndex = Math.floor(Math.random() * currentChosen.length);
        console.log(randomIndex);
        chosenRant = currentChosen[randomIndex];
        ph.innerHTML = chosenRant["name"];
    }
};

var timeoutInside = () => {
    if(count != MAX_FLASH){
        randomChanging();
        flashing = setTimeout(timeoutInside, 200);
        count += 1;
    }else{
        endFlashing();
    }
};

var endFlashing = () => {
    clearTimeout(flashing);
    details.style.display = "block";
    result.style.backgroundColor = "Orange";
    
    pricetag.innerHTML = chosenRant["type"] + ", 价格约" + chosenRant["prices"];
    
    commentList = chosenRant["commentList"];
    
    commentString = "口味 " + commentList[0] + " | 环境 " + commentList[1] + " | 服务 "+ commentList[2];
    
    comments.innerHTML = commentString;
    
    actuAddrs.innerHTML = chosenRant["actuAddr"];
    
};

var addFlashing = () => {
    if (currentChosen.length != 0){
        if(flashing != null){
            result.style.backgroundColor = "transparent";
            details.style.display = "none";
            clearTimeout(flashing);
            count = 0;
        }
        flashing = setTimeout(timeoutInside, 200);
    }
};


chooseButton.onclick = addFlashing;


httpRequest.onreadystatechange = () => {
    rstntString = httpRequest.responseText;
    renderPage(rstntString);
};

httpRequest.open("GET", "restaurants.json", true);
httpRequest.send();

renderPage(rstntString);

body.style.height = document.body.clientHeight;