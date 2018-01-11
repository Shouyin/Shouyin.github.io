"use strict";

/* 
 * timetable - tObjects.js
 * Written by Shouyin 
 * Jan 11 2018
 * 
 */

var unitHeight = 12.5;

var tObjects = function (unitHeight) {

    var movingBox;

    var mouseMoveStart = false;
    var gridsIn = {
        "inList": "",
        "grids": new Set(),
        "startFrom": -1,
        "endAt": -1
    };

    var itemsIdMap = new Object();
    var coursesIdMap = new Object();
    var uls = new Array();
    var lists = new Array();

    var idLength = 7;
    var lessOccupiedForItem = 4;
    var mostOccupiedForItem = 40;

    var chosenGridColor = "coral";
    var defaultGridColor = "transparent";
    var defaultGridSubColor = "rgba(0, 0, 0, 0.025)";

    var confirmMsg = "One or more classes will be replaced...";
    var boundReachedMsg = "Reached the bound...";

    var idGenerator = function idGenerator(prefix, idMap) {
        var s = "$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var id = prefix;
        for (var i = 0; i < idLength; i++) {
            id += s[Math.ceil(Math.random() * s.length)];
        }
        if (id in idMap) {
            return idGenerator();
        }
        return id;
    };

    /*
     *  Func for converting hours to occupied
     */

    var _hrsToOccupied = function _hrsToOccupied(hrs) {
        return hrs * 4;
    };

    var _occupiedToHrs = function _occupiedToHrs(occupied) {
        return Math.floor(occupied / 4) + occupied % 4 * 0.25;
    };

    var _hrsToTime = function _hrsToTime(hrs) {
        hrs = Number(hrs);
        var hr = Math.floor(hrs);
        if (hr >= 24) {
            hr -= Math.floor(hr / 24) * 24;
        }
        var dec = hrs - Math.floor(hrs);
        dec = dec * 60;
        if (!Boolean(dec)) {
            dec = dec + "0";
        }
        return hr + ":" + dec;
    };

    /*
     *  Export
     */

    var _exportCourseToJsonObj = function _exportCourseToJsonObj(course) {
        var tmpObj = new Object();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = Object.getOwnPropertyNames(course.kinds)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var kind = _step.value;

                tmpObj[kind] = new Array();
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = course.kinds[kind][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var item = _step2.value;

                        tmpObj[kind].push(item.exportToJsonObj());
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

        return tmpObj;
    };

    var exportTimetableToJsonObj = function exportTimetableToJsonObj() {
        var tmpObj = new Object();

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = Object.getOwnPropertyNames(coursesIdMap)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var courseId = _step3.value;

                tmpObj[coursesIdMap[courseId].name] = _exportCourseToJsonObj(coursesIdMap[courseId]);
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

        return tmpObj;
    };

    /*
     *  Func for building ClassObject (wirrten as "item")
     */

    var _buildItem = function _buildItem(elem, occupied, gridClassName) {
        //almost all "item" in the context should be classObject...
        var newItemObj = new ClassObject(elem, unitHeight, "hld", occupied);
        var id = idGenerator("item-", itemsIdMap);
        itemsIdMap[id] = newItemObj;
        newItemObj.id = id;
        newItemObj.format();
        return id;
    };

    var addFuncForItemGridsInList = function addFuncForItemGridsInList(item, list) {
        var n = item.occupiedIndexInList;
        for (var p = 0; p < item.grids.length; p++) {
            item.grids[p].ondrop = function (ele, i, t, tc) {
                return function (e) {
                    bk(t, tc);
                    ele.addItem(itemsIdMap[event.dataTransfer.getData("movingItemId")], i);
                };
            }(list, n + p, item.grids[p], item.grids[p].style.backgroundColor);
            item.grids[p].ondragenter = function (t, i) {
                return function (event) {
                    return hldent(movingBox, t, i);
                };
            }(item.grids[p], n + p);
            item.grids[p].ondragleave = function (t, tc) {
                return function () {
                    return bk(t, tc);
                };
            }(item.grids[p], item.grids[p].style.backgroundColor);
            item.grids[p].ondragover = function (event) {
                return ago(event);
            };
        }
    };

    /*
     *  Func for building Course(Object)
     */

    var _buildCourse = function _buildCourse(elem, name) {
        var newCourseObj = new Course(elem, name);
        var id = idGenerator("course-", coursesIdMap);
        newCourseObj.id = id;
        coursesIdMap[id] = newCourseObj;
        return id;
    };

    /*
     *  Other functions...
     */

    var _checkCourseExist = function _checkCourseExist(name) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = Object.getOwnPropertyNames(coursesIdMap)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var i = _step4.value;

                if (coursesIdMap[i].name == name) {
                    return i;
                }
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

        return undefined;
    };

    var afterMarkOutFromList = function afterMarkOutFromList(tmpOccupied, startFrom, listId) {};

    var initializeGridsIn = function initializeGridsIn() {
        var list = gridsIn["inList"];
        list.grids[gridsIn["startFrom"]].innerHTML = "";
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = gridsIn["grids"][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var i = _step5.value;

                list.grids[i].ondragleave();
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

        gridsIn["grids"] = new Set();
    };

    var addFuncForListGrid = function addFuncForListGrid(newGrid, list, j) {
        var defaultBkColor = newGrid.style.backgroundColor;

        newGrid.ondragstart = function (event) {
            event.preventDefault();
        };

        newGrid.ondragenter = function (event) {
            hldent(movingBox, newGrid, j);
        };

        newGrid.ondragleave = function () {
            bk(newGrid, defaultBkColor);
        };

        newGrid.ondrop = function (event) {
            bk(newGrid, defaultBkColor);
            list.addItem(itemsIdMap[event.dataTransfer.getData("movingItemId")], j);
        };
        newGrid.ondragover = function (event) {
            return ago(event);
        };

        newGrid.onmousedown = function () {
            if (!mouseMoveStart) {
                mouseMoveStart = true;
                gridsIn["startTime"] = _hrsToTime(_occupiedToHrs(j) + 7);
                gridsIn["startFrom"] = j;
                gridsIn["inList"] = list;
            }
        };

        newGrid.onmousemove = function () {
            if (mouseMoveStart & list === gridsIn["inList"]) {

                var reverse = false;
                if (j < gridsIn["startFrom"]) {
                    reverse = true;
                }

                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = gridsIn["grids"][Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var i = _step6.value;

                        if (!reverse & i > j | reverse & i < j | reverse & i > gridsIn["startFrom"] | !reverse & i < gridsIn["startFrom"]) {
                            list.grids[i].ondragleave();
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

                var currentOccupied = 1 + j - gridsIn["startFrom"];
                if (reverse) {
                    currentOccupied = 1 + gridsIn["startFrom"] - j;
                }
                var currentHrs = _occupiedToHrs(currentOccupied);
                gridsIn["grids"].add(j);

                newGrid.style.backgroundColor = chosenGridColor;

                if (currentOccupied > mostOccupiedForItem) {
                    list.grids[gridsIn["startFrom"]].innerHTML = gridsIn["startTime"] + " too much!";
                } else if (currentOccupied < lessOccupiedForItem) {
                    list.grids[gridsIn["startFrom"]].innerHTML = gridsIn["startTime"] + " at least 1hr";
                } else {
                    list.grids[gridsIn["startFrom"]].innerHTML = gridsIn["startTime"] + " hrs: " + currentHrs;
                }
            }
        };

        newGrid.onmouseup = function () {
            if (mouseMoveStart & list === gridsIn["inList"]) {
                gridsIn["endAt"] = j;
                initializeGridsIn(list);
                mouseMoveStart = false;

                var startFrom = gridsIn["startFrom"];
                var endAt = gridsIn["endAt"];
                if (endAt < startFrom) {
                    var m = startFrom;
                    startFrom = endAt;
                    endAt = m;
                }

                var tmpOccupied = endAt - startFrom + 1;
                afterMarkOutFromList(tmpOccupied, startFrom, gridsIn["inList"].id);
            } else if (mouseMoveStart & list !== gridsIn["inList"]) {
                initializeGridsIn();
                mouseMoveStart = false;
            }
        };
    };

    var dealWithConflictItem = function dealWithConflictItem(item) {
        if (Boolean(uls[0])) {
            uls[0].addItem(item);
        }
    };

    var _changeItemKind = function _changeItemKind(item, newKindName) {
        var oldKindName = item.kindName;

        if (Boolean(newKindName) & newKindName !== oldKindName) {
            if (Boolean(item.parentCourse)) {
                item.parentCourse.kinds[oldKindName].splice(item.indexInKind, 1);
                item.parentCourse.addKind(newKindName, [item]);

                //umm...
                item.parentCourse.updateKind(oldKindName);
                item.parentCourse.updateKind(newKindName);
                item.parentCourse.update();
            }
        } else {
            item.update();
            return false;
        }
    };

    var _checkItemStatus = function _checkItemStatus(item) {
        var status = "";
        if (Boolean(item.parentList)) {
            var timeStartFrom = _occupiedToHrs(item.occupiedIndexInList) + 7;
            timeStartFrom = _hrsToTime(timeStartFrom);

            var timeEndAt = _occupiedToHrs(item.occupiedIndexInList + item.occupied) + 7;
            timeEndAt = _hrsToTime(timeEndAt);

            status = item.parentList.elem.id.toUpperCase() + ":&nbsp;" + timeStartFrom + " - " + timeEndAt;
        } else {
            status = "PENDING";
        }
        return status;
    };

    /*  objects...
     *  ItemObject
     */

    function ItemObject(elem, occupied) {
        this.elem = elem;
        this.elem.draggable = "true";
        this.elem.style.position = "relative";
        this.parentList = null;
        this.occupied = occupied;

        this.id;

        this.elem.ondragstart = function (t) {
            return function (event) {
                event.dataTransfer.setData("movingItemId", t.id);
                movingBox = t;
                event.dataTransfer.setDragImage(t.elem, 0, 0);
            };
        }(this);
    }

    ItemObject.prototype.addData = function (obj) {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            for (var _iterator7 = Object.getOwnPropertyNames(obj)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var i = _step7.value;

                this[i] = obj[i];
            }
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
    };

    /*
     *  ClassObject, extends from ItemObject but doesnt inherit the prototype chain
     */

    function ClassObject(elem, gridHeight, gridClassName, occupied) {
        ItemObject.call(this, elem, occupied);

        //these are for timetable
        this.nodesInDocument;

        this.grids = new Array();
        for (var i = 0; i < occupied; i++) {
            var newGrid = document.createElement("div");
            newGrid.className = gridClassName;
            newGrid.style.width = "100%";
            newGrid.style.height = gridHeight;
            newGrid.style.position = "absolute";
            newGrid.style.top = i * gridHeight + "px";
            this.elem.insertBefore(newGrid, this.elem.children[this.elem.children.length - 1]);
            this.grids.push(newGrid);
        }
    }

    ClassObject.prototype.update = function (nodeObject) {
        //update children nodes of itemObject.elem

        if (!Boolean(nodeObject)) {
            nodeObject = this.nodesInDocument;
        }

        var hrs = _occupiedToHrs(this.occupied);
        if (hrs > 1) {
            hrs += "hrs";
        } else {
            hrs += "hr";
        }
        hrs += " - ";

        if ("kindName" in nodeObject) {
            nodeObject["kindName"].innerHTML = this.kindName;
        }
        if ("parentCourseName" in nodeObject) {
            nodeObject["parentCourseName"].innerHTML = this.parentCourse.name;
        }
        if ("self" in nodeObject) {
            nodeObject["self"].style.backgroundColor = this.elem.style.backgroundColor;
        }
        if ("subTitle" in nodeObject) {
            nodeObject["subTitle"].innerHTML = hrs + this.parentCourse.name;
        }

        //for timetable
        if ("kindBox" in nodeObject) {
            nodeObject["kindBox"].value = this.kindName;
        }
        if ("kindIndex" in nodeObject) {
            nodeObject["kindIndex"].innerHTML = this.indexInKind + 1;
        }
    };

    ClassObject.prototype.format = function () {
        this.elem.style.width = "100%";
        this.elem.style.height = this.occupied * unitHeight + "px";
        this.elem.style.position = "absolute";
        this.elem.style.top = this.occupiedIndexInList * unitHeight + "px";
    };

    ClassObject.prototype.exportToJsonObj = function () {
        var tmpAry = new Array();
        tmpAry.push(this.occupied);
        if (Boolean(this.parentList)) {
            tmpAry.push(this.parentList.indexInLists);
            tmpAry.push(this.occupiedIndexInList);
        }
        return tmpAry;
    };

    ClassObject.prototype.addData = function (args) {
        if ("parentCourse" in args) {
            this.parentCourse = args["parentCourse"];
        }
        if ("kindName" in args) {
            this.kindName = args["kindName"];
        }
        if ("indexInKind" in args) {
            this.indexInKind = args["indexInKind"];
        }
        if ("occupiedIndexInList" in args) {
            this.occupiedIndexInList = args["occupiedIndexInList"];
        }
    };

    ClassObject.prototype.deleteSelf = function () {
        //I don't know if .deleteSelf() is a good (or acceptable) idea...
        if (Boolean(this.parentList)) {
            this.parentList.removeItem(this);
        }
        if (Boolean(this.parentCourse) & Boolean(this.kindName)) {
            this.parentCourse.kinds[this.kindName].splice(this.indexInKind, 1);
            this.parentCourse.updateKind(this.kindName);
            this.parentCourse.update();
        }
        this.elem.parentElement.removeChild(this.elem);
    };

    /*
     *  Course(Object)
     */

    function Course(elem, name) {
        this.elem = elem;
        this.kinds = new Object();
        this.name = name;
        this.kindsCount = 0;
        /*this.mainColor = "rgb(134, 150, 166)";*/

        this.id;
        this.nodesInDocument;
    }

    Course.prototype.addKind = function (name, ItemObjectArray) {
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
            for (var _iterator8 = ItemObjectArray[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var i = _step8.value;

                i.addData({ "parentCourse": this, "kindName": name });
            }
        } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                    _iterator8.return();
                }
            } finally {
                if (_didIteratorError8) {
                    throw _iteratorError8;
                }
            }
        }

        if (!Boolean(this.kinds[name.valueOf()])) {
            this.kinds[name.valueOf()] = new Array();
        }
        this.kinds[name.valueOf()] = this.kinds[name.valueOf()].concat(ItemObjectArray);
        this.kindsCount += 1;

        this.updateKind(name.valueOf());
        this.update();

        return this.kindsCount;
    };

    Course.prototype.deleteSelf = function () {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
            for (var _iterator9 = Object.getOwnPropertyNames(this.kinds)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                var kind = _step9.value;
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    for (var _iterator10 = this.kinds[kind][Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        var item = _step10.value;

                        item.parentCourse = null;
                        item.deleteSelf();
                    }
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }

                delete this.kinds[kind];
            }
        } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                    _iterator9.return();
                }
            } finally {
                if (_didIteratorError9) {
                    throw _iteratorError9;
                }
            }
        }

        this.elem.parentNode.removeChild(this.elem);
        delete coursesIdMap[this.id];
    };

    Course.prototype.update = function (nodeObject) {
        //update all elements...

        if (!Boolean(nodeObject)) {
            nodeObject = this.nodesInDocument;
        }

        if ("courseName" in nodeObject) {
            nodeObject["courseName"].innerHTML = this.name;
        }
        if ("courseNameBox" in nodeObject) {
            nodeObject["courseNameBox"].value = this.name;
        }
        if ("kindNames" in nodeObject) {
            nodeObject["kindNames"].innerHTML = "";
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = Object.getOwnPropertyNames(this.kinds)[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var i = _step11.value;

                    var kindName = i;
                    if (kindName.length >= 5) {
                        kindName = kindName.slice(0, 4) + "...";
                    }
                    nodeObject["kindNames"].innerHTML += this.kinds[i].length + " " + kindName + ", ";
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }
        }
    };

    Course.prototype.updateKind = function (kind) {
        if (kind in this.kinds) {
            if (this.kinds[kind].length === 0) {
                delete this.kinds[kind];
            } else {
                for (var i = 0; i < this.kinds[kind].length; i++) {
                    this.kinds[kind][i].addData({ "indexInKind": i });
                    this.kinds[kind][i].update();
                }
            }
        }
    };

    /*
     *  ListObject
     */

    function ListObject(elem, gridHeight, gridClassName, n) {
        this.elem = elem;
        this.elem.style.position = "relative";
        this.items = new Array();

        this.id;

        for (var i = 0; i < n; i++) {
            this.items.push(null);
        }

        this.grids = new Array();
        for (var j = 0; j < n; j++) {
            var newGrid = document.createElement("div");
            newGrid.className = gridClassName;
            newGrid.style.height = gridHeight;

            if (Math.floor(j / 4) % 2 === 1) {
                newGrid.style.backgroundColor = defaultGridSubColor;
            }
            if (j === n - 1) {
                newGrid.style.borderBottomLeftRadius = "12.5px";
                newGrid.style.borderBottomRightRadius = "12.5px";
            }
            this.elem.appendChild(newGrid);

            //eventHandler!
            addFuncForListGrid(newGrid, this, j);

            this.grids.push(newGrid);
        }
    }

    ListObject.prototype.addItem = function (item, n) {
        //elem add and obj add

        if (Boolean(item)) {
            //add a check of normalList
            var confirmed = true;
            if (n + item.occupied <= this.grids.length) {
                for (var i = n; i < n + item.occupied; i++) {
                    if (Boolean(this.items[i]) & this.items[i] !== item) {
                        confirmed = confirm(confirmMsg);
                        break;
                    }
                }
                if (confirmed) {
                    if (Boolean(item.parentList)) {
                        item.parentList.removeItem(item);
                    }
                    for (var j = n; j < n + item.occupied; j++) {
                        if (this.items[j]) {
                            dealWithConflictItem(this.items[j]);
                            this.removeItem(this.items[j]);
                        }
                        this.items[j] = item;
                    }

                    item.parentList = this;
                    item.addData({ "occupiedIndexInList": n });

                    addFuncForItemGridsInList(item, this);

                    this.elem.appendChild(item.elem);
                    item.format();
                }
            } else {
                alert(boundReachedMsg);
            }
        } else {
            throw ReferenceError("item can not be null.");
        }
    };

    ListObject.prototype.removeItem = function (item) {
        var t = this;
        for (var i = 0; i < t.items.length; i++) {
            if (t.items[i] === item) {
                t.items[i].parentList = null;
                t.items[i] = null;
            }
        }
    };

    ListObject.prototype.toString = function () {
        return "[ListObject id " + this.elem.id + " items" + this.items.toString() + "]";
    };

    function NormalListObject(elem) {
        this.elem = elem;

        this.elem.ondrop = function (t) {
            return function (event) {
                var movingItem = itemsIdMap[event.dataTransfer.getData("movingItemId")];
                if (Boolean(movingItem.parentList)) {
                    movingItem.parentList.removeItem(movingItem);
                }
                t.addItem(itemsIdMap[event.dataTransfer.getData("movingItemId")]);
            };
        }(this);
        this.elem.ondragover = function (event) {
            event.preventDefault();
        };
    }

    NormalListObject.prototype.addItem = function (item, prevItem) {
        item.elem.style.position = "relative";
        item.elem.style.top = "0px";
        for (var p = 0; p < item.grids.length; p++) {
            item.grids[p].ondrop = function (t) {
                return function (e) {
                    var movingItem = itemsIdMap[e.dataTransfer.getData("movingItemId")];
                    if (Boolean(movingItem.parentList)) {
                        movingItem.parentList.removeItem(movingItem);
                    }
                    t.addItem(movingItem, item);
                    e.stopPropagation();
                };
            }(this);
            item.grids[p].ondragenter = undefined;
            item.grids[p].ondragover = function (event) {
                return ago(event);
            };
        }
        if (Boolean(prevItem)) {
            this.elem.insertBefore(item.elem, prevItem.elem);
        } else {
            this.elem.insertBefore(item.elem, this.elem.children[0]);
        }
    };

    //  drag and drop

    function hldent(item, t, j) {
        t.innerHTML = _hrsToTime(_occupiedToHrs(j) + 7) + " - " + _hrsToTime(_occupiedToHrs(j) + 7 + _occupiedToHrs(item.occupied)) + " ..";
        t.style.backgroundColor = chosenGridColor;
    }

    function bk(t, tc) {
        t.innerHTML = "";
        t.style.backgroundColor = tc;
    }

    function ago(e) {
        e.preventDefault();
    }

    return {

        addListFromElem: function addListFromElem(elem, gridClassName, listOccupied) {
            var tmpObj = new ListObject(elem, unitHeight, "hld", listOccupied);
            tmpObj.indexInLists = lists.length;
            lists.push(tmpObj);
            tmpObj.id = lists.length - 1;
        },

        addNormalListForItems: function addNormalListForItems(elem) {
            var normalList = new NormalListObject(elem);
            uls.push(normalList);
            return uls.length - 1;
        },

        exportAllToJsonObj: function exportAllToJsonObj() {
            return exportTimetableToJsonObj();
        },

        exportCourseToJsonObj: function exportCourseToJsonObj(courseId) {
            if (courseId in coursesIdMap) {
                return _exportCourseToJsonObj(coursesIdMap[courseId]);
            }
        },

        deleteAll: function deleteAll(except) {
            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
                for (var _iterator12 = Object.getOwnPropertyNames(coursesIdMap)[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                    var courseId = _step12.value;

                    coursesIdMap[courseId].deleteSelf();
                }
            } catch (err) {
                _didIteratorError12 = true;
                _iteratorError12 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion12 && _iterator12.return) {
                        _iterator12.return();
                    }
                } finally {
                    if (_didIteratorError12) {
                        throw _iteratorError12;
                    }
                }
            }
        },

        setChosenCourse: function setChosenCourse(course) {
            chosenCourse = course;
        },

        hrsToOccupied: function hrsToOccupied(hrs) {
            return _hrsToOccupied(hrs);
        },

        occupiedToHrs: function occupiedToHrs(occupied) {
            return _occupiedToHrs(occupied);
        },

        hrsToTime: function hrsToTime(hrs) {
            return _hrsToTime(hrs);
        },

        buildItem: function buildItem(elem, occupied, gridClassName) {
            return _buildItem(elem, occupied, gridClassName);
        },

        changeItemKind: function changeItemKind(itemId, newKindName) {
            if (itemId in itemsIdMap) {
                _changeItemKind(itemsIdMap[itemId], newKindName);
            }
        },

        setUpdateNodesOfItem: function setUpdateNodesOfItem(itemId, nodeObject) {
            if (itemId in itemsIdMap) {
                itemsIdMap[itemId].nodesInDocument = nodeObject;
            }
        },

        setUpdateNodesOfCourse: function setUpdateNodesOfCourse(courseId, nodeObject) {
            if (courseId in coursesIdMap) {
                coursesIdMap[courseId].nodesInDocument = nodeObject;
            }
        },

        checkItemStatus: function checkItemStatus(itemId) {
            if (itemId in itemsIdMap) {
                return _checkItemStatus(itemsIdMap[itemId]);
            }
        },

        getUpdateNodeOfItem: function getUpdateNodeOfItem(itemId) {
            if (itemId in itemsIdMap) {
                var nodesInDocument = itemsIdMap[itemId].nodesInDocument;
                if (Boolean(nodesInDocument)) {
                    return nodesInDocument;
                }
            }
        },

        updateForItem: function updateForItem(nodeObject, itemId) {
            if (itemId in itemsIdMap) {
                itemsIdMap[itemId].update(nodeObject);
            }
        },

        getItemElem: function getItemElem(itemId) {
            if (itemId in itemsIdMap) {
                return itemsIdMap[itemId].elem;
            }
        },

        updateForCourse: function updateForCourse(nodeObject, courseId) {
            if (courseId in coursesIdMap) {
                coursesIdMap[courseId].update(nodeObject);
            }
        },

        deleteObj: function deleteObj(objId) {
            if ("item-" == objId.slice(0, 5)) {
                if (objId in itemsIdMap) {
                    itemsIdMap[objId].deleteSelf();
                    delete itemsIdMap[objId];
                }
            } else if ("course-" == objId.slice(0, 7)) {
                if (objId in coursesIdMap) {
                    coursesIdMap[objId].deleteSelf();
                    delete coursesIdMap[objId];
                }
            }
        },

        buildCourse: function buildCourse(elem, name) {
            return _buildCourse(elem, name);
        },

        addItemToList: function addItemToList(itemId, listId, n) {
            if (itemId in itemsIdMap & Boolean(lists[listId])) {
                lists[listId].addItem(itemsIdMap[itemId], n);
            }
        },

        changeItemCourse: function changeItemCourse(itemId, newCourseId) {
            if (itemId in itemsIdMap & newCourseId in coursesIdMap) {
                var item = itemsIdMap[itemId];
                item.parentCourse.kinds[item.kindName].splice(item.indexInKind, 1);
                item.parentCourse.updateKind(item.kindName);
                item.parentCourse.update();

                var newCourse = coursesIdMap[newCourseId];
                newCourse.addKind(item.kindName, [item]);
            }
        },

        setMarkOutFunc: function setMarkOutFunc(func) {
            afterMarkOutFromList = func;
        },

        addItemToNormalList: function addItemToNormalList(itemId, normalListId) {
            if (itemId in itemsIdMap) {
                uls[normalListId].addItem(itemsIdMap[itemId]);
            }
        },

        checkCourseExist: function checkCourseExist(name) {
            return _checkCourseExist(name);
        },

        addKindToCourse: function addKindToCourse(name, itemIds, courseId) {
            if (courseId in coursesIdMap) {
                var itemObjs = new Array();
                var _iteratorNormalCompletion13 = true;
                var _didIteratorError13 = false;
                var _iteratorError13 = undefined;

                try {
                    for (var _iterator13 = itemIds[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                        var itemId = _step13.value;

                        if (itemId in itemsIdMap) {
                            itemObjs.push(itemsIdMap[itemId]);
                        }
                    }
                } catch (err) {
                    _didIteratorError13 = true;
                    _iteratorError13 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion13 && _iterator13.return) {
                            _iterator13.return();
                        }
                    } finally {
                        if (_didIteratorError13) {
                            throw _iteratorError13;
                        }
                    }
                }

                coursesIdMap[courseId].addKind(name, itemObjs);
            }
        },

        checkCourseExistById: function checkCourseExistById(courseId) {
            return courseId in coursesIdMap;
        },

        getCourseName: function getCourseName(courseId) {
            if (courseId in coursesIdMap) {
                return coursesIdMap[courseId].name;
            }
        },

        setCourseName: function setCourseName(courseId, newName) {
            if (courseId in coursesIdMap) {
                if (coursesIdMap[courseId].name !== newName) {
                    coursesIdMap[courseId].name = newName;
                    var _iteratorNormalCompletion14 = true;
                    var _didIteratorError14 = false;
                    var _iteratorError14 = undefined;

                    try {
                        for (var _iterator14 = Object.getOwnPropertyNames(coursesIdMap[courseId].kinds)[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                            var kind = _step14.value;

                            coursesIdMap[courseId].updateKind(kind);
                        }
                    } catch (err) {
                        _didIteratorError14 = true;
                        _iteratorError14 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion14 && _iterator14.return) {
                                _iterator14.return();
                            }
                        } finally {
                            if (_didIteratorError14) {
                                throw _iteratorError14;
                            }
                        }
                    }

                    coursesIdMap[courseId].update();
                }
            }
        },

        getItemId: function getItemId(courseId, kindName, indexInKind) {
            if (courseId in coursesIdMap) {
                return coursesIdMap[courseId].kinds[kindName][indexInKind].id;
            }
        }

    };
}(unitHeight);