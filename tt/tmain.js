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

var tMain = function () {

    var courseBoxSample = document.getElementById("courseboxsample");
    var classBlockSample = document.getElementById("classblocksample");
    var stdbyList = document.getElementById("stdbylist");

    var courseContainer = document.getElementById("cc");
    var classboxhldr = document.getElementById("cbh");
    var controltopbar = document.getElementById("cttb");
    var controlwindow = document.getElementById("ctc");
    var chosenclassbox = document.getElementById("ccb");
    var cwclosebutton = document.getElementById("controlcontainerbig");

    /*const cbaddcoursebutton = document.getElementById("cbacbutton");*/
    var cbaddcoursebutton = document.getElementById("addcbox");
    var cbexportjsonbutton = document.getElementById("cbejbutton");
    var cbexportimagebutton = document.getElementById("cbeibutton");
    var cbimportjsonbutton = document.getElementById("cbijbutton");
    var icaddcourse = document.getElementById("ac");
    var icexportjson = document.getElementById("ej");
    var icexportimage = document.getElementById("ei");
    var icimportjson = document.getElementById("ij");

    var coursename = document.getElementById("ctcn");
    var addclasskindbutton = document.getElementById("addclasskind");
    var ckname = document.getElementById("ckname");
    var hnumber = document.getElementById("hnumber");
    var kindpreviewboxsample = document.getElementById("kindpreviewboxsample");
    var ccckindlist = document.getElementById("ccckindlist");
    var addcoursebtn = document.getElementById("addcrs");

    var ejtargetta = document.getElementById("ejtargetta");

    var ijtargetta = document.getElementById("ijtargetta");
    var clearcheckbox = document.getElementById("clearcheckbox");
    var ijimportbutton = document.getElementById("importj");

    var eiqrcodesvg = document.getElementById("iceiqrcodesvgbox");

    /*const maxCourses;
    const maxKinds;
    const maxClassInKind;
    const maxClassHours;*/

    var defaultListOccupied = 56;
    var lessOccupiedForItem = 4;
    var mostOccupiedForItem = 40;

    var tbmd = false;
    var prevX, prevY;

    var unnamedCourse = 1;

    var kindNameBoxFontWidth = 10;
    var kindIndexBoxMarginLeft = 3;
    var kindNameBoxMaxWidth = 80;
    var kindNameBoxMinWidth = 15;

    var tmpCourses = {
        "CLAS 20008": {
            "p": [[4], [4, 0, 7], [4]],
            "u": [[7], [7]]
        },
        "TEST 20007": {
            "d": [[6], [6, 1, 9], [5]]
        }
    };

    var stdbyListIndex = 0;

    var defaultKindName = "undef";

    var tmpKinds = new Object();
    var coursesBuffer = new Array();

    var chosenCourseId;
    var defaultCourseName = "__Free";
    var defaultCourseId;

    var defaultCourseColor = ["rgb(250, 250, 250)", "rgb(109, 109, 109)", "rgb(156, 156, 156)"];

    var colors = [["rgb(147, 204, 234)", "rgb(115, 129, 142)", "rgb(134, 150, 166)"], ["rgb(181, 196, 177)", "rgb(123, 139, 112)", "rgb(150, 164, 139)"], ["rgb(196, 162, 233)", "rgb(121, 81, 165)", "rgb(144, 98, 194)"], ["rgb(146, 190, 244)", "rgb(81, 113, 165)", "rgb(98, 141, 194)"], ["rgb(244, 176, 146)", "rgb(165, 109, 81)", "rgb(194, 130, 98)"], ["rgb(237, 171, 194)", "rgb(168, 70, 105)", "rgb(190, 100, 132)"], ["rgb(141, 171, 239)", "rgb(76, 109, 182)", "rgb(104, 129, 186)"]];

    var colorCourseMap = new Object();

    function giveColorToCourse(courseId) {
        var colorAry = colors[Math.round(Math.random() * (colors.length - 1))];
        if (!(courseId in colorCourseMap)) {
            colorCourseMap[courseId] = colorAry;
        }
    }

    function giveColorToItem(itemId, courseId) {
        var elem = tObjects.getItemElem(itemId);
        var colorAry = colorCourseMap[courseId];
        elem.style.backgroundColor = colorAry[0];

        var kindNameBox = elem.children[0].children[0];
        var kindIndexBox = elem.children[0].children[1];
        var dtBox = elem.children[0].children[2];
        var ddBox = elem.children[0].children[3];

        kindNameBox.style.color = colorAry[1];
        kindIndexBox.style.color = colorAry[1];
        ddBox.style.color = colorAry[2];
    }

    function updateChosenBox(itemId) {
        var nodeObject = {
            "self": chosenclassbox,
            "kindName": chosenclassbox.children[0],
            "parentCourseName": chosenclassbox.children[1]
        };
        tObjects.updateForItem(nodeObject, itemId);
        chosenclassbox.children[2].innerHTML = tObjects.checkItemStatus(itemId);
    }

    function initializeChosenBox() {
        chosenclassbox.style.backgroundColor = "rgb(242, 242, 242)";
        chosenclassbox.children[0].innerHTML = "";
        chosenclassbox.children[1].innerHTML = "";
        chosenclassbox.children[2].innerHTML = "";
    }

    var markOutBuildItem = function markOutBuildItem(tmpOccupied, startFrom, listId) {
        if (tmpOccupied >= lessOccupiedForItem & tmpOccupied <= mostOccupiedForItem & Boolean(tObjects.checkCourseExistById(chosenCourseId))) {

            var itemId = buildItem(tmpOccupied, "hld");

            giveColorToItem(itemId, chosenCourseId);

            tObjects.addKindToCourse(defaultKindName, [itemId], chosenCourseId);
            tObjects.addItemToList(itemId, listId, startFrom);
            var nodeObject = tObjects.getUpdateNodeOfItem(itemId);
            changeKindBoxWidth(nodeObject["kindBox"], nodeObject["kindIndex"]);
            tObjects.getUpdateNodeOfItem(itemId)["kindBox"].focus();
        }
    };

    var addFuncForCloseButton = function addFuncForCloseButton(elem, objId) {
        var closeButton = elem.children[elem.children.length - 1];
        closeButton.style.display = "none";
        if (objId.indexOf("item-") === 0) {
            closeButton.onclick = function (event) {
                initializeChosenBox();

                tObjects.deleteObj(objId);
                event.stopPropagation();
            };
        } else if (objId.indexOf("course-") === 0) {
            closeButton.onclick = function (event) {
                if (Boolean(window.onclick)) {
                    window.onclick();
                }

                tObjects.deleteObj(objId);
                event.stopPropagation();
                delete colorCourseMap[objId];
            };
        }
        closeButton.onclick = function (event) {
            initializeChosenBox();

            tObjects.deleteObj(objId);
            event.stopPropagation();
        };
        elem.onmouseover = function () {
            closeButton.style.display = "block";
        };
        elem.onmouseout = function () {
            closeButton.style.display = "none";
        };
    };

    var changeKindBoxWidth = function changeKindBoxWidth(kindNameElem, kindIndexElem) {
        var newLength = kindNameElem.value.length * kindNameBoxFontWidth;
        if (newLength >= kindNameBoxMaxWidth) {
            newLength = kindNameBoxMaxWidth;
        }
        if (newLength <= kindNameBoxMinWidth) {
            newLength = kindNameBoxMinWidth;
        }
        kindNameElem.style.width = newLength + "px";
        kindIndexElem.style.marginLeft = newLength + kindIndexBoxMarginLeft + "px";
    };

    var addFuncForKindNameBox = function addFuncForKindNameBox(elem, kindNameElem, kindIndexElem, itemId) {

        kindNameElem.onblur = function () {
            elem.draggable = true;
            var newKindName = kindNameElem.value;
            var res = tObjects.changeItemKind(itemId, newKindName);
            if (!res) {
                changeKindBoxWidth(kindNameElem, kindIndexElem);
            }
        };

        kindNameElem.onkeydown = function (event) {
            if (event.keyCode == "13") {
                kindNameElem.blur();
            }
            changeKindBoxWidth(kindNameElem, kindIndexElem);
        };

        /*
        kindNameElem.oninput = function(){
            changeKindBoxWidth(kindNameElem, kindIndexElem);
        };*/

        kindNameElem.onclick = function () {
            kindNameElem.select();
        };

        kindNameElem.onfocus = function () {
            elem.draggable = false;
        };
    };

    var addFuncForItemElem = function addFuncForItemElem(elem, itemId) {
        elem.onclick = function (itemId) {
            return function (event) {
                if (Boolean(window.onclick)) {
                    window.onclick();
                }
                elem.style.boxShadow = "0px 0px 75px 3px rgba(0, 0, 0, 0.3)";
                elem.style.borderStyle = "solid";
                elem.style.borderWidth = "2px";
                elem.style.borderColor = "rgba(0, 0, 0, 0)";
                elem.parentNode.style.zIndex = "50";
                elem.style.zIndex = "50";
                updateChosenBox(itemId);
                window.onclick = function () {
                    initializeChosenBox();
                    elem.style.border = "none";
                    elem.style.boxShadow = "none";
                    if (Boolean(elem.parentElement)) {
                        elem.parentElement.style.zIndex = "20";
                    }
                    elem.style.zIndex = "20";
                };
                event.stopPropagation();
            };
        }(itemId);
    };

    var buildItem = function buildItem(occupied, gridClassName) {
        var newItemElem = classBlockSample.cloneNode(true);

        var itemId = tObjects.buildItem(newItemElem, occupied, gridClassName);
        addFuncForItemElem(newItemElem, itemId);
        addFuncForCloseButton(newItemElem, itemId);

        var kindNameBox = newItemElem.children[0].children[0];
        var kindIndexBox = newItemElem.children[0].children[1];
        var dtBox = newItemElem.children[0].children[2];
        var ddBox = newItemElem.children[0].children[3];

        kindNameBox.ondragstart = function (event) {
            event.stopPropagation();
            event.preventDefault();
        };

        addFuncForKindNameBox(newItemElem, kindNameBox, kindIndexBox, itemId);

        var nodeObject = {
            "self": newItemElem,
            "kindBox": kindNameBox,
            "subTitle": ddBox,
            "kindIndex": kindIndexBox
        };

        tObjects.setUpdateNodesOfItem(itemId, nodeObject);
        return itemId;
        //addFuncForItem(newItemObj);
    };

    //fajhcsbedhilfvbalsikebf
    var addFuncForCourseBox = function addFuncForCourseBox(elem, courseId) {
        elem.onclick = function (course) {
            return function (event) {
                if (Boolean(window.onclick)) {
                    window.onclick();
                }
                chosenCourseId = courseId;
                elem.style.borderStyle = "solid";
                elem.style.borderColor = colorCourseMap[courseId][0];
                elem.style.borderWidth = "2px";
                window.onclick = function () {
                    elem.style.border = "none";
                    chosenCourseId = defaultCourseId;
                };
                event.stopPropagation();
            };
        }(courseId);

        elem.ondrop = function (event) {
            var itemId = event.dataTransfer.getData("movingItemId");
            tObjects.changeItemCourse(itemId, courseId);
            giveColorToItem(itemId, courseId);
        };

        elem.ondragover = function (event) {
            event.preventDefault();
        };
    };

    var addFuncForCNameBox = function addFuncForCNameBox(courseNameBox, courseId) {
        courseNameBox.onblur = function () {
            if (Boolean(courseNameBox.value)) {
                tObjects.setCourseName(courseId, courseNameBox.value);
            } else {
                courseNameBox.value = tObjects.getCourseName(courseId);
            }
        };

        courseNameBox.onkeydown = function (event) {
            if (event.keyCode == "13") {
                courseNameBox.blur();
            }
        };
    };

    var buildCourse = function buildCourse(name) {
        var newCourseElem = courseBoxSample.cloneNode(true);
        var courseId = tObjects.buildCourse(newCourseElem, name);

        giveColorToCourse(courseId);
        newCourseElem.children[0].children[0].style.backgroundColor = colorCourseMap[courseId][0];

        var courseNameBox = newCourseElem.children[0].children[1];
        var kindNameBox = newCourseElem.children[1];
        var editButton = newCourseElem.children[newCourseElem.children.length - 2];

        editButton.onclick = function (t) {
            return function () {
                openControlWindow("ec", t);
            };
        }(courseId);

        var nodeObject = {
            "courseNameBox": courseNameBox,
            "kindNames": kindNameBox
        };

        tObjects.setUpdateNodesOfCourse(courseId, nodeObject);
        courseContainer.insertBefore(newCourseElem, courseContainer.children[1]);

        addFuncForCourseBox(newCourseElem, courseId);
        addFuncForCloseButton(newCourseElem, courseId);
        addFuncForCNameBox(courseNameBox, courseId);

        if (Boolean(arguments[1])) {
            newCourseElem.style.display = "none";
        }

        tObjects.updateForCourse(undefined, courseId);

        return courseId;
    };

    var addItemToStdbyList = function addItemToStdbyList(itemId) {
        tObjects.addItemToNormalList(itemId, stdbyListIndex);
    };

    var applyChanges = function applyChanges(obj) {
        //need to check the obj then deal expections.
        var courseId = void 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = Object.getOwnPropertyNames(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var crs = _step.value;

                courseId = tObjects.checkCourseExist(crs);
                if (!Boolean(courseId)) {
                    courseId = buildCourse(crs);
                }
                var itemObjectArray = void 0;
                var tmpItemId = void 0;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = Object.getOwnPropertyNames(obj[crs])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var pdItem = _step2.value;

                        var itemIds = new Array();
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = obj[crs][pdItem][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var itemAry = _step3.value;

                                tmpItemId = buildItem(itemAry[0]);
                                itemIds.push(tmpItemId);
                                if (itemAry.length > 1) {
                                    tObjects.addItemToList(tmpItemId, itemAry[1], itemAry[2]);
                                } else {
                                    addItemToStdbyList(tmpItemId);
                                }
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        tObjects.addKindToCourse(pdItem, itemIds, courseId);
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = itemIds[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var itemId = _step4.value;

                                var nodeObject = tObjects.getUpdateNodeOfItem(itemId);
                                changeKindBoxWidth(nodeObject["kindBox"], nodeObject["kindIndex"]);
                                giveColorToItem(itemId, courseId);
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    };

    //functions for buttons after click
    var closeControlWindow = function closeControlWindow() {
        controlwindow.style.display = "none";
    };

    var initializeForControlBox = function initializeForControlBox() {
        coursesBuffer = new Array();
        tmpKinds = new Object();
        coursename.value = "";
        ckname.value = "";
        knumber.value = "";
        hnumber.value = "";
        ijtargetta.value = "";
        for (var i = ccckindlist.children.length - 1; i >= 0; i--) {
            ccckindlist.children[i].parentNode.removeChild(ccckindlist.children[i]);
        }
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = document.getElementsByClassName("innercontrol")[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var innerControl = _step5.value;

                innerControl.style.display = "none";
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                    _iterator5.return();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
                }
            }
        }
    };

    var openControlWindow = function openControlWindow(tab) {
        initializeForControlBox();
        //open different tabs depends on buttons
        controlwindow.style.display = "block";
        if (tab === "ac") {
            controltopbar.children[0].innerHTML = "Add a course";
            icaddcourse.style.display = "block";
            addcoursebtn.onclick = function () {
                return inputToObj(coursename.value);
            };
        } else if (tab === "ej") {
            controltopbar.children[0].innerHTML = "Export to JSON";
            icexportjson.style.display = "block";
            ejtargetta.value = JSON.stringify(tObjects.exportAllToJsonObj());
        } else if (tab === "ij") {
            controltopbar.children[0].innerHTML = "Import from JSON";
            icimportjson.style.display = "block";
        } else if (tab === "ei") {
            controltopbar.children[0].innerHTML = "Export to QR Code";
            icexportimage.style.display = "block";
            /*eiqrcodeimg.src = QRCode.generatePNG(JSON.stringify(exportTimetableToJsonObj()));*/
            eiqrcodesvg.innerHTML = "";
            var stringForQrcode = location.host + location.pathname + "?att=" + encodeURI(JSON.stringify(tObjects.exportAllToJsonObj())) + ";";

            eiqrcodesvg.appendChild(QRCode.generateSVG(stringForQrcode));
        } else if (tab == "ec") {
            var courseId = arguments[1];
            if (Boolean(courseId)) {
                controltopbar.children[0].innerHTML = "Edit " + tObjects.getCourseName(courseId);
                addcoursebtn.onclick = function () {
                    inputToObj(coursename.value, courseId);
                };
                var tmpKindBox = void 0;

                var courseKinds = tObjects.exportCourseToJsonObj(courseId);

                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = Object.getOwnPropertyNames(courseKinds)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var kind = _step6.value;

                        for (var i = 0; i < courseKinds[kind].length; i++) {

                            var itemId = tObjects.getItemId(courseId, kind, i);
                            var status = tObjects.checkItemStatus(itemId);

                            tmpKindBox = buildTmpKindElement(kind, tObjects.occupiedToHrs(courseKinds[kind][i][0]));

                            if (status !== "PENDING") {
                                tmpKindBox.children[0].innerHTML += " arranged, " + status;
                            }

                            tmpKindBox.children[1].onclick = function (itm, t) {
                                return function () {
                                    tObjects.deleteObj(itm);
                                    t.parentNode.removeChild(t);
                                };
                            }(itemId, tmpKindBox);
                        }
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }

                coursename.value = tObjects.getCourseName(courseId);
                icaddcourse.style.display = "block";
            }
        }
    };

    var inputToObj = function inputToObj(newName, courseId) {
        var condition = Boolean(newName) & newName !== defaultCourseName;

        if (condition) {
            var tmpObj = new Object();
            if (Boolean(courseId)) {
                tObjects.setCourseName(courseId, newName);
            }
            tmpObj[newName] = tmpKinds;
            applyChanges(tmpObj);
            closeControlWindow();
            //need to initialize buffer array
        } else {
            alert("invalid");
        }
    };

    var buildTmpKindElement = function buildTmpKindElement(kindName, hrs) {
        var kindBox = void 0;
        kindBox = kindpreviewboxsample.cloneNode(true);
        kindBox.children[0].innerHTML = kindName + " " + hrs + "hrs ";
        ccckindlist.insertBefore(kindBox, ccckindlist.children[0]);
        return kindBox;
    };

    var addNewKindToTmp = function addNewKindToTmp(kindName, hrs) {
        var condition = Boolean(kindName) & Boolean(hrs) & Number(hrs) <= 10 & Number(hrs) >= 1 & Number(hrs) * 4 === parseInt(String(Number(hrs) * 4));
        if (condition) {
            var kindBox = void 0;
            var tmpClass = [tObjects.hrsToOccupied(hrs)];
            if (!(kindName in tmpKinds)) {
                tmpKinds[kindName] = new Array();
            }
            tmpKinds[kindName].push(tmpClass);
            kindBox = buildTmpKindElement(kindName, hrs);
            kindBox.children[1].onclick = function (kind, t, n) {
                return function () {
                    tmpKinds[kind].splice(tmpKinds[kind].indexOf(tmpClass), 1);
                    if (tmpKinds[kind].length === 0) {
                        delete tmpKinds[kind];
                    }
                    t.parentNode.removeChild(t);
                };
            }(kindName, kindBox, tmpKinds[kindName].length);
        } else {
            alert("invalid");
        }
    };

    var importJson = function importJson() {
        if (clearcheckbox.checked) {
            //move deleteself?
            tObjects.deleteAll();

            colorCourseMap = new Object();

            defaultCourseId = buildCourse("__Free", true);
            colorCourseMap[defaultCourseId] = defaultCourseColor;
            chosenCourseId = defaultCourseId;
        }
        //need to check the environment
        try {
            var tmpObj = JSON.parse(ijtargetta.value);
            applyChanges(tmpObj);
        } catch (SyntaxError) {}

        closeControlWindow();
    };

    //Initialize function
    var initialize = function initialize() {

        var tmpObj = void 0;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            for (var _iterator7 = document.getElementsByClassName("classlist")[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var i = _step7.value;

                tObjects.addListFromElem(i, "hld", defaultListOccupied);
            }

            //initializing pending list...
        } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                    _iterator7.return();
                }
            } finally {
                if (_didIteratorError7) {
                    throw _iteratorError7;
                }
            }
        }

        stdbyListIndex = tObjects.addNormalListForItems(stdbyList);
        tObjects.setMarkOutFunc(markOutBuildItem);

        defaultCourseId = buildCourse(defaultCourseName, true);
        colorCourseMap[defaultCourseId] = defaultCourseColor;
        chosenCourseId = defaultCourseId;

        controlwindow.style.top = "100px";
        controlwindow.style.left = "150px";

        controltopbar.onmousedown = function (event) {
            prevX = event.clientX;
            prevY = event.clientY;
            tbmd = true;
        };
        controlwindow.onmousemove = function (event) {
            if (tbmd) {
                controlwindow.style.top = Number(controlwindow.style.top.slice(0, -2)) + (event.clientY - prevY) + "px";
                controlwindow.style.left = Number(controlwindow.style.left.slice(0, -2)) + (event.clientX - prevX) + "px";

                prevX = event.clientX;
                prevY = event.clientY;
            }
        };
        controlwindow.onmouseup = function () {
            tbmd = false;
        };

        cwclosebutton.onclick = closeControlWindow;
        addclasskindbutton.onclick = function () {
            return addNewKindToTmp(ckname.value, hnumber.value);
        };
        addcoursebtn.onclick = function () {
            return inputToObj(coursename.value);
        };
        cbaddcoursebutton.onclick = function () {
            return openControlWindow("ac");
        };

        cbaddcoursebutton.onclick = function () {
            buildCourse("No name" + " " + unnamedCourse);
            unnamedCourse++;
        };

        cbexportjsonbutton.onclick = function () {
            return openControlWindow("ej");
        };
        cbimportjsonbutton.onclick = function () {
            return openControlWindow("ij");
        };
        ijimportbutton.onclick = function () {
            return importJson();
        };
        cbexportimagebutton.onclick = function () {
            return openControlWindow("ei");
        };
        controlwindow.style.display = "none";
    };

    var checkOnLoad = function checkOnLoad() {
        var paramString = location.search;
        paramString = decodeURI(paramString);
        var startIndex = paramString.indexOf("att=");
        if (startIndex >= 0) {
            var endIndex = paramString.indexOf(";");
            if (endIndex >= 0) {
                try {
                    var exportedJsonObj = JSON.parse(paramString.slice(startIndex + 4, endIndex));
                    applyChanges(exportedJsonObj);
                } catch (SyntaxError) {
                    console.log("Umm...");
                }
            }
        }
    };

    initialize();
    checkOnLoad();

    applyChanges(tmpCourses);
}();