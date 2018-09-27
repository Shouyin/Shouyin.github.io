var blurAddrSelect = document.getElementById("blurAddrSelect");
var ph = document.getElementById("ph");

var httpRequest = new XMLHttpRequest();
var rstntString = "";

var renderPage = (rstntString) => {
    let rstnts = JSON.parse(rstntString);
    for (let blurAddrs in rstnts){
        let opt = document.createElement("option");
        opt.innerHTML = blurAddrs;
        opt.value = blurAddrs;
        blurAddrSelect.appendChild(opt);
    }
    
}

httpRequest.onreadystatechange = () => {
    rstntString = httpRequest.responseText;
    ph.innerHTML = rstntString;
};

httpRequest.open("GET", "restaurants.json", true);
httpRequest.send();