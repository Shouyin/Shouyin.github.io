"use strict";

/* 
 * timetable - tmain.js
 * Written by Shouyin
 * Jan 11 2018
 * 
 * .QRCode - qr.js
 * qr.js is written by Kang Seonghoon <public+qrjs@mearie.org>
 *
 */

var tMain = (function(){

const courseBoxSample = document.getElementById("courseboxsample");
const classBlockSample = document.getElementById("classblocksample");
const stdbyList = document.getElementById("stdbylist");

const courseContainer = document.getElementById("cc");
const classboxhldr = document.getElementById("cbh");
const controltopbar = document.getElementById("cttb");
const controlwindow = document.getElementById("ctc");
const chosenclassbox = document.getElementById("ccb");
const cwclosebutton = document.getElementById("controlcontainerbig");

/*const cbaddcoursebutton = document.getElementById("cbacbutton");*/
const cbaddcoursebutton = document.getElementById("addcbox");
const cbexportjsonbutton = document.getElementById("cbejbutton");
const cbexportimagebutton = document.getElementById("cbeibutton");
const cbimportjsonbutton = document.getElementById("cbijbutton");
const icaddcourse = document.getElementById("ac");
const icexportjson = document.getElementById("ej");
const icexportimage = document.getElementById("ei");
const icimportjson = document.getElementById("ij");


const coursename = document.getElementById("ctcn");
const addclasskindbutton = document.getElementById("addclasskind");
const ckname = document.getElementById("ckname");
const hnumber = document.getElementById("hnumber");
const kindpreviewboxsample = document.getElementById("kindpreviewboxsample");
const ccckindlist = document.getElementById("ccckindlist");
const addcoursebtn = document.getElementById("addcrs");

const ejtargetta = document.getElementById("ejtargetta");

const ijtargetta = document.getElementById("ijtargetta");
const clearcheckbox = document.getElementById("clearcheckbox");
const ijimportbutton = document.getElementById("importj");

const eiqrcodesvg = document.getElementById("iceiqrcodesvgbox");

/*const maxCourses;
const maxKinds;
const maxClassInKind;
const maxClassHours;*/

const defaultListOccupied = 56;
const lessOccupiedForItem = 4;
const mostOccupiedForItem = 40;


var tbmd = false;
var prevX, prevY;
    
var unnamedCourse = 1;

var kindNameBoxFontWidth = 10;
var kindIndexBoxMarginLeft = 3;
var kindNameBoxMaxWidth = 80;
var kindNameBoxMinWidth = 15;

var stdbyListIndex = 0;


var defaultKindName = "undef";

var tmpKinds = new Object();
var coursesBuffer = new Array();

var chosenCourseId;
var defaultCourseName = "__Free";
var defaultCourseId;

var defaultCourseColor = ["rgb(250, 250, 250)", "rgb(109, 109, 109)", "rgb(156, 156, 156)"];

var colors = [["rgb(147, 204, 234)", "rgb(115, 129, 142)", "rgb(134, 150, 166)"],
             ["rgb(181, 196, 177)", "rgb(123, 139, 112)", "rgb(150, 164, 139)"],
             ["rgb(196, 162, 233)", "rgb(121, 81, 165)", "rgb(144, 98, 194)"],
            ["rgb(146, 190, 244)", "rgb(81, 113, 165)", "rgb(98, 141, 194)"],
            ["rgb(244, 176, 146)", "rgb(165, 109, 81)", "rgb(194, 130, 98)"],
            ["rgb(237, 171, 194)", "rgb(168, 70, 105)", "rgb(190, 100, 132)"],
            ["rgb(141, 171, 239)", "rgb(76, 109, 182)", "rgb(104, 129, 186)"],];

var colorCourseMap = new Object();


function giveColorToCourse(courseId){
    var colorAry = colors[Math.round(Math.random() * (colors.length - 1))];
    if(!(courseId in colorCourseMap)){
        colorCourseMap[courseId] = colorAry;
    }
}

function giveColorToItem(itemId, courseId){
    var elem = tObjects.getItemElem(itemId);
    var colorAry = colorCourseMap[courseId];
    elem.style.backgroundColor = colorAry[0];
    
    let kindNameBox = elem.children[0].children[0];
    let kindIndexBox = elem.children[0].children[1];
    let dtBox = elem.children[0].children[2];
    let ddBox = elem.children[0].children[3];
    
    kindNameBox.style.color = colorAry[1];
    kindIndexBox.style.color = colorAry[1];
    ddBox.style.color = colorAry[2];
}


function updateChosenBox(itemId){
    let nodeObject = {
        "self": chosenclassbox,
        "kindName": chosenclassbox.children[0],
        "parentCourseName": chosenclassbox.children[1],
    }
    tObjects.updateForItem(nodeObject, itemId);
    chosenclassbox.children[2].innerHTML = tObjects.checkItemStatus(itemId);
}

function initializeChosenBox(){
    chosenclassbox.style.backgroundColor = "rgb(242, 242, 242)";
    chosenclassbox.children[0].innerHTML = "";
    chosenclassbox.children[1].innerHTML = "";
    chosenclassbox.children[2].innerHTML = "";
}


var markOutBuildItem = function(tmpOccupied, startFrom, listId){
    if(tmpOccupied >= lessOccupiedForItem & tmpOccupied <= mostOccupiedForItem & Boolean(tObjects.checkCourseExistById(chosenCourseId))){
        
        let itemId = buildItem(tmpOccupied, "hld");
        
        giveColorToItem(itemId, chosenCourseId);
        
        tObjects.addKindToCourse(defaultKindName, [itemId], chosenCourseId);
        tObjects.addItemToList(itemId, listId, startFrom);
        let nodeObject = tObjects.getUpdateNodeOfItem(itemId);
        changeKindBoxWidth(nodeObject["kindBox"], nodeObject["kindIndex"]);
        tObjects.getUpdateNodeOfItem(itemId)["kindBox"].focus();
    }
}


var addFuncForCloseButton = function(elem, objId){
    let closeButton = elem.children[elem.children.length - 1];
    closeButton.style.display = "none";
    if(objId.indexOf("item-") === 0){
        closeButton.onclick = function(event){
            initializeChosenBox();

            tObjects.deleteObj(objId);
            event.stopPropagation();
        }
    }else if(objId.indexOf("course-") === 0){
        closeButton.onclick = function(event){
            if(Boolean(window.onclick)){
                window.onclick();
            }

            tObjects.deleteObj(objId);
            event.stopPropagation();
            delete colorCourseMap[objId];
        }
    }
    closeButton.onclick = function(event){
        initializeChosenBox();
        
        tObjects.deleteObj(objId);
        event.stopPropagation();
    }
    elem.onmouseover = function(){
        closeButton.style.display = "block";
    };
    elem.onmouseout = function(){
        closeButton.style.display = "none";
    }
};


var changeKindBoxWidth = function(kindNameElem, kindIndexElem){
    let newLength = kindNameElem.value.length * kindNameBoxFontWidth;
    if(newLength >= kindNameBoxMaxWidth){
        newLength = kindNameBoxMaxWidth;
    }
    if(newLength <= kindNameBoxMinWidth){
        newLength = kindNameBoxMinWidth;
    }
    kindNameElem.style.width = newLength + "px";
    kindIndexElem.style.marginLeft = newLength + kindIndexBoxMarginLeft + "px";
}

var addFuncForKindNameBox = function(elem, kindNameElem, kindIndexElem, itemId){
    
    kindNameElem.onblur = function(){
        elem.draggable = true;
        let newKindName = kindNameElem.value;
        let res = tObjects.changeItemKind(itemId, newKindName);
        if(!res){
            changeKindBoxWidth(kindNameElem, kindIndexElem);
        }
    };

    kindNameElem.onkeydown = function(event){
        if(event.keyCode == "13"){
            kindNameElem.blur();
        }
        changeKindBoxWidth(kindNameElem, kindIndexElem);
    }
    
    /*
    kindNameElem.oninput = function(){
        changeKindBoxWidth(kindNameElem, kindIndexElem);
    };*/
    
    kindNameElem.onclick = function(){
        kindNameElem.select();
    }
    
    kindNameElem.onfocus = function(){
        elem.draggable = false;
    }
    
};

var addFuncForItemElem = function(elem, itemId){
    elem.onclick = (function(itemId){
        return ((event)=> {
            if(Boolean(window.onclick)){
                window.onclick();
            }
            elem.style.boxShadow = "0px 0px 75px 3px rgba(0, 0, 0, 0.3)";
            elem.style.borderStyle = "solid";
            elem.style.borderWidth = "2px";
            elem.style.borderColor = "rgba(0, 0, 0, 0)";
            elem.parentNode.style.zIndex = "50";
            elem.style.zIndex = "50";
            updateChosenBox(itemId);
            window.onclick = function(){
                initializeChosenBox();
                elem.style.border = "none";
                elem.style.boxShadow = "none";
                if(Boolean(elem.parentElement)){
                    elem.parentElement.style.zIndex = "20";
                }
                elem.style.zIndex = "20";
            }
            event.stopPropagation();
        });              
    })(itemId);
};
    

var buildItem = function(occupied, gridClassName){
    let newItemElem = classBlockSample.cloneNode(true);
    
    let itemId = tObjects.buildItem(newItemElem, occupied, gridClassName);
    addFuncForItemElem(newItemElem, itemId);
    addFuncForCloseButton(newItemElem, itemId);
    
    let kindNameBox = newItemElem.children[0].children[0];
    let kindIndexBox = newItemElem.children[0].children[1];
    let dtBox = newItemElem.children[0].children[2];
    let ddBox = newItemElem.children[0].children[3];
    
    kindNameBox.ondragstart = function(event){
        event.stopPropagation();
        event.preventDefault();
    }
    
    addFuncForKindNameBox(newItemElem, kindNameBox, kindIndexBox, itemId);
    
    let nodeObject = {
        "self": newItemElem,
        "kindBox": kindNameBox,
        "subTitle": ddBox,
        "kindIndex": kindIndexBox
    }
    
    tObjects.setUpdateNodesOfItem(itemId, nodeObject);
    return itemId;
    //addFuncForItem(newItemObj);
}


//fajhcsbedhilfvbalsikebf
var addFuncForCourseBox = function(elem, courseId){
    elem.onclick = (function(course){
        return (event) =>{
            if(Boolean(window.onclick)){
                window.onclick();
            }
            chosenCourseId = courseId;
            elem.style.borderStyle = "solid";
            elem.style.borderColor = colorCourseMap[courseId][0];
            elem.style.borderWidth = "2px";
            window.onclick = function(){
                elem.style.border = "none";
                chosenCourseId = defaultCourseId;
            }
            event.stopPropagation();
        }
    })(courseId);
    
    elem.ondrop = function(event){
        let itemId = event.dataTransfer.getData("movingItemId");
        tObjects.changeItemCourse(itemId, courseId);
        giveColorToItem(itemId, courseId);
    };
    
    elem.ondragover = function(event){
        event.preventDefault();
    }
    
};

var addFuncForCNameBox = function(courseNameBox, courseId){
    courseNameBox.onblur = function(){
        if(Boolean(courseNameBox.value)){
            tObjects.setCourseName(courseId, courseNameBox.value);
        }else{
            courseNameBox.value = tObjects.getCourseName(courseId);
        }
    }
    
    courseNameBox.onkeydown = function(event){
        if(event.keyCode == "13"){
            courseNameBox.blur();
        }
    }
    
}
    
var buildCourse = function(name){
    let newCourseElem = courseBoxSample.cloneNode(true);
    let courseId = tObjects.buildCourse(newCourseElem, name);
    
    giveColorToCourse(courseId);
    newCourseElem.children[0].children[0].style.backgroundColor = colorCourseMap[courseId][0];
    
    let courseNameBox = newCourseElem.children[0].children[1];
    let kindNameBox = newCourseElem.children[1];
    let editButton = newCourseElem.children[newCourseElem.children.length - 2];

    editButton.onclick = (function(t){
        return () => {
            openControlWindow("ec", t);
        }
    })(courseId);
    
    let nodeObject = {
        "courseNameBox": courseNameBox,
        "kindNames": kindNameBox
    }
    
    tObjects.setUpdateNodesOfCourse(courseId, nodeObject);
    courseContainer.insertBefore(newCourseElem, courseContainer.children[1]);
    
    addFuncForCourseBox(newCourseElem, courseId);
    addFuncForCloseButton(newCourseElem, courseId);
    addFuncForCNameBox(courseNameBox, courseId);
    
    if(Boolean(arguments[1])){
        newCourseElem.style.display = "none";
    }
    
    tObjects.updateForCourse(undefined, courseId);
    
    return courseId;
}


var addItemToStdbyList = function(itemId){
    tObjects.addItemToNormalList(itemId, stdbyListIndex);
}

var applyChanges = function(obj){
//need to check the obj then deal expections.
    let courseId;
    for (let crs of Object.getOwnPropertyNames(obj)){
        courseId = tObjects.checkCourseExist(crs);
        if(!Boolean(courseId)){
            courseId = buildCourse(crs);
        }
        let itemObjectArray;
        let tmpItemId;
        for (let pdItem of Object.getOwnPropertyNames(obj[crs])){
            let itemIds = new Array();
            for (let itemAry of obj[crs][pdItem]){
                tmpItemId = buildItem(itemAry[0]);
                itemIds.push(tmpItemId);
                if(itemAry.length > 1){
                    tObjects.addItemToList(tmpItemId, itemAry[1], itemAry[2]);
                }else{
                    addItemToStdbyList(tmpItemId);
                }
            }
            tObjects.addKindToCourse(pdItem, itemIds, courseId);
            for (let itemId of itemIds){
                let nodeObject = tObjects.getUpdateNodeOfItem(itemId);
                changeKindBoxWidth(nodeObject["kindBox"], nodeObject["kindIndex"]);
                giveColorToItem(itemId, courseId);
            }
        }
    }
};











//functions for buttons after click
var closeControlWindow = function(){
    controlwindow.style.display = "none";
}


var initializeForControlBox = function(){
    coursesBuffer = new Array();
    tmpKinds = new Object();
    coursename.value = "";
    ckname.value = "";
    knumber.value = "";
    hnumber.value = "";
    ijtargetta.value = "";
    for (let i = ccckindlist.children.length - 1; i >= 0; i --){
        ccckindlist.children[i].parentNode.removeChild(ccckindlist.children[i]);
    }
    for (let innerControl of document.getElementsByClassName("innercontrol")){
        innerControl.style.display = "none";
    }
}


var openControlWindow = function(tab){
    initializeForControlBox();
    //open different tabs depends on buttons
    controlwindow.style.display = "block";
    if(tab === "ac"){
        controltopbar.children[0].innerHTML = "Add a course";
        icaddcourse.style.display = "block";
        addcoursebtn.onclick = () => inputToObj(coursename.value);

    }else if(tab === "ej"){
        controltopbar.children[0].innerHTML = "Export to JSON";
        icexportjson.style.display = "block";
        ejtargetta.value = JSON.stringify(tObjects.exportAllToJsonObj());

    }else if(tab === "ij"){
        controltopbar.children[0].innerHTML = "Import from JSON";
        icimportjson.style.display = "block";

    }else if(tab === "ei"){
        controltopbar.children[0].innerHTML = "Export to QR Code";
        icexportimage.style.display = "block";
        /*eiqrcodeimg.src = QRCode.generatePNG(JSON.stringify(exportTimetableToJsonObj()));*/
       eiqrcodesvg.innerHTML = "";
        let stringForQrcode = location.host + location.pathname + "?att=" + encodeURI(JSON.stringify(tObjects.exportAllToJsonObj()) + "&");
        
        eiqrcodesvg.appendChild(QRCode.generateSVG(stringForQrcode));

    }else if(tab == "ec"){
        let courseId = arguments[1];
        if(Boolean(courseId)){
            controltopbar.children[0].innerHTML = "Edit " + tObjects.getCourseName(courseId);
            addcoursebtn.onclick = () => {
                inputToObj(coursename.value, courseId);
            }
            let tmpKindBox;

            let courseKinds = tObjects.exportCourseToJsonObj(courseId);
            
            for (let kind of Object.getOwnPropertyNames(courseKinds)){
                for (let i = 0; i < courseKinds[kind].length; i ++){
                    
                    let itemId = tObjects.getItemId(courseId, kind, i);
                    let status = tObjects.checkItemStatus(itemId);
                    
                    tmpKindBox = buildTmpKindElement(kind, 
                                                     tObjects.occupiedToHrs(courseKinds[kind][i][0]));
                    
                    if(status !== "PENDING"){
                        tmpKindBox.children[0].innerHTML += " arranged, " + status;
                    }
                    
                    tmpKindBox.children[1].onclick = (function(itm, t){
                        return () => {
                            tObjects.deleteObj(itm);
                            t.parentNode.removeChild(t);
                        }
                    })(itemId, tmpKindBox);
                    
                }
            }
            
            coursename.value = tObjects.getCourseName(courseId);
            icaddcourse.style.display = "block";
        }
    }
}


var inputToObj = function(newName, courseId){
    let condition = Boolean(newName) & newName !== defaultCourseName;
    
    if(condition){
        let tmpObj = new Object();
        if(Boolean(courseId)){
            tObjects.setCourseName(courseId, newName);
        }
        tmpObj[newName] = tmpKinds;
        applyChanges(tmpObj);
        closeControlWindow();
        //need to initialize buffer array
    }else{
        alert("invalid");
    }
}

var buildTmpKindElement = function(kindName, hrs){
    let kindBox;
    kindBox = kindpreviewboxsample.cloneNode(true);
    kindBox.children[0].innerHTML = kindName + " " + hrs + "hrs ";
    ccckindlist.insertBefore(kindBox, ccckindlist.children[0]);
    return kindBox;
}


var addNewKindToTmp = function(kindName, hrs){
    let condition = Boolean(kindName) &
                    Boolean(hrs) &
                    Number(hrs) <= 10 &
                    Number(hrs) >= 1 &
                    Number(hrs) * 4 === parseInt(String(Number(hrs) * 4));
    if(condition){
        let kindBox;
        let tmpClass = [tObjects.hrsToOccupied(hrs)];
        if(!(kindName in tmpKinds)){
            tmpKinds[kindName] = new Array();
        }
        tmpKinds[kindName].push(tmpClass);
        kindBox = buildTmpKindElement(kindName, hrs);
        kindBox.children[1].onclick = (function(kind, t, n){
            return ()=> {
                tmpKinds[kind].splice(tmpKinds[kind].indexOf(tmpClass), 1);
                if(tmpKinds[kind].length === 0){
                    delete tmpKinds[kind];
                }
                t.parentNode.removeChild(t);
            }
        })(kindName, kindBox, tmpKinds[kindName].length);
            
    }else{
        alert("invalid");
    }
}


var importJson = function(){
    if(clearcheckbox.checked){
        //move deleteself?
        tObjects.deleteAll();
        
        colorCourseMap = new Object();
        
        defaultCourseId = buildCourse("__Free", true);
        colorCourseMap[defaultCourseId] = defaultCourseColor;
        chosenCourseId = defaultCourseId;
    }
    //need to check the environment
    try{
        let tmpObj = JSON.parse(ijtargetta.value);
        applyChanges(tmpObj);
    }catch(SyntaxError){
        
    }
    
    closeControlWindow();
}


//Initialize function
var initialize = function(){
    
    let tmpObj;
    for(let i of document.getElementsByClassName("classlist")){
        tObjects.addListFromElem(i, "hld", defaultListOccupied);
    }
    
    //initializing pending list...
    
    stdbyListIndex = tObjects.addNormalListForItems(stdbyList);
    tObjects.setMarkOutFunc(markOutBuildItem);
    
    defaultCourseId = buildCourse(defaultCourseName, true);
    colorCourseMap[defaultCourseId] = defaultCourseColor;
    chosenCourseId = defaultCourseId;
    
    
    controlwindow.style.top = "100px";
    controlwindow.style.left = "150px";
    
    controltopbar.onmousedown = function(event){
        prevX = event.clientX;
        prevY = event.clientY;
        tbmd = true;
    }
    controlwindow.onmousemove = function(event){
        if(tbmd){
            controlwindow.style.top = Number(controlwindow.style.top.slice(0, -2)) + (event.clientY - prevY) + "px";
            controlwindow.style.left = Number(controlwindow.style.left.slice(0, -2)) + (event.clientX - prevX) + "px";
            
            prevX = event.clientX;
            prevY = event.clientY;
        }
    }
    controlwindow.onmouseup = function(){
        tbmd = false;
    }
    
    cwclosebutton.onclick = closeControlWindow;
    addclasskindbutton.onclick = () => addNewKindToTmp(ckname.value, hnumber.value);
    addcoursebtn.onclick = () => inputToObj(coursename.value);
    cbaddcoursebutton.onclick = () => openControlWindow("ac");
    
    cbaddcoursebutton.onclick = () => {
        buildCourse("No name" + " " + unnamedCourse);
        unnamedCourse ++;
    };
    
    cbexportjsonbutton.onclick = () => openControlWindow("ej");
    cbimportjsonbutton.onclick = () => openControlWindow("ij");
    ijimportbutton.onclick = () => importJson();
    cbexportimagebutton.onclick = () => openControlWindow("ei");
    controlwindow.style.display = "none";
    
}

var checkOnLoad = function(){
    let paramString = location.search;
    paramString = decodeURI(paramString);
    let startIndex = paramString.indexOf("att=");
    if(startIndex >= 0){
        let endIndex = paramString.indexOf("&");
        if (endIndex >= 0){
            try{
                let exportedJsonObj = JSON.parse(paramString.slice(startIndex + 4, endIndex));
                applyChanges(exportedJsonObj);
            }catch(SyntaxError){
                console.log("Umm...");
            }
        }
    }
}

initialize();
checkOnLoad();

applyChanges(tmpCourses);

})();

