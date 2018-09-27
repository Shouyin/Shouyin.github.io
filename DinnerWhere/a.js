var blurAddrSelect = document.getElementById("blurAddrSelect");
var ph = document.getElementById("ph");

var httpRequest = new XMLHttpRequest();
var rstntString = "";

httpRequest.onreadystatechange = () => {
    rstntString = httpRequest.responseText;
    ph.innerHTML = rstntString;
};

httpRequest.open("GET", "restaurants.json", true);
httpRequest.send();