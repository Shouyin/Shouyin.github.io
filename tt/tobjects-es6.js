"use strict";

/* 
 * timetable - tObjects.js
 * Written by Shouyin 
 * Jan 11 2018
 * 
 */

const unitHeight = 12.5;

var tObjects = (function(unitHeight){
    
    var movingBox;
    
    var mouseMoveStart = false;
    var gridsIn = {
        "inList": "",
        "grids": new Set(),
        "startFrom": -1,
        "endAt": -1
    }
    
    var itemsIdMap = new Object();
    var coursesIdMap = new Object();
    var uls = new Array();
    var lists = new Array();
    
    var idLength = 7;
    const lessOccupiedForItem = 4;
    const mostOccupiedForItem = 40;

    var chosenGridColor = "coral";
    var defaultGridColor = "transparent";
    var defaultGridSubColor = "rgba(0, 0, 0, 0.025)";

    var confirmMsg = "One or more classes will be replaced...";
    var boundReachedMsg = "Reached the bound...";
    
    var idGenerator = function(prefix, idMap){
        let s = "$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let id = prefix;
        for (let i = 0; i < idLength; i ++){
            id += s[Math.ceil(Math.random()*s.length)];
        }
        if(id in idMap){
            return idGenerator();
        }
        return id;
    }
    
    
    
    /*
     *  Func for converting hours to occupied
     */
    
    var hrsToOccupied = function(hrs){
        return hrs * 4;
    };

    var occupiedToHrs = function(occupied){
        return Math.floor(occupied / 4) + (occupied % 4) * 0.25;
    };

    var hrsToTime = function(hrs){
        hrs = Number(hrs);
        let hr = Math.floor(hrs);
        if(hr >= 24){
            hr -= (Math.floor(hr / 24) * 24);
        }
        let dec = hrs - Math.floor(hrs);
        dec = dec * 60;
        if(!Boolean(dec)){
            dec = dec + "0";
        }
        return hr + ":" + dec;
    };
    
    
    
    /*
     *  Export
     */
    
    var exportCourseToJsonObj = function(course){
        let tmpObj = new Object();
        for (let kind of Object.getOwnPropertyNames(course.kinds)){
            tmpObj[kind] = new Array();
            for (let item of course.kinds[kind]){
                tmpObj[kind].push(item.exportToJsonObj());
            }
        }
        return tmpObj;
    };
    
    var exportTimetableToJsonObj = function(){
        let tmpObj = new Object();
        
        for (let courseId of Object.getOwnPropertyNames(coursesIdMap)){
            tmpObj[coursesIdMap[courseId].name] = exportCourseToJsonObj(coursesIdMap[courseId]);
        }
        return tmpObj;
    };
    
    
    
    /*
     *  Func for building ClassObject (wirrten as "item")
     */
    
    var buildItem = function(elem, occupied, gridClassName){
        //almost all "item" in the context should be classObject...
        let newItemObj = new ClassObject(elem, unitHeight, "hld", occupied);
        let id = idGenerator("item-", itemsIdMap);
        itemsIdMap[id] = newItemObj;
        newItemObj.id = id;
        newItemObj.format();
        return id;
    };
    
    var addFuncForItemGridsInList = function(item, list){
        let n = item.occupiedIndexInList;
        for(let p = 0; p < item.grids.length; p ++){
            item.grids[p].ondrop = (function(ele, i, t, tc){
                            return  ((e)=>{
                                        bk(t, tc);
                                        ele.addItem(itemsIdMap[event.dataTransfer.getData("movingItemId")], i);
                                    });
            })(list, n + p, item.grids[p], item.grids[p].style.backgroundColor);
            item.grids[p].ondragenter = (function(t, i){
                return ((event)=> hldent(movingBox,t, i));
            })(item.grids[p], n + p);
            item.grids[p].ondragleave = (function(t, tc){
                return (()=> bk(t, tc));
            })(item.grids[p], item.grids[p].style.backgroundColor);
            item.grids[p].ondragover = ((event)=> ago(event));
        }
    };
    
    
    /*
     *  Func for building Course(Object)
     */

    var buildCourse = function(elem, name){
        let newCourseObj = new Course(elem, name);
        let id = idGenerator("course-", coursesIdMap);
        newCourseObj.id = id;
        coursesIdMap[id] = newCourseObj;
        return id;
    };
    
    
    
    /*
     *  Other functions...
     */
    
    var checkCourseExist = function(name){
        for (let i of Object.getOwnPropertyNames(coursesIdMap)){
            if(coursesIdMap[i].name == name){
                return i;
            }
        }
        return undefined;
    };
    
    var afterMarkOutFromList = function(tmpOccupied, startFrom, listId){
        
    };
    
    var initializeGridsIn = function(){
        let list = gridsIn["inList"];
        list.grids[gridsIn["startFrom"]].innerHTML = "";
        for (let i of gridsIn["grids"]){
            list.grids[i].ondragleave();
        }
        gridsIn["grids"] = new Set();
    };
    
    var addFuncForListGrid = function(newGrid, list, j){
        let defaultBkColor = newGrid.style.backgroundColor;

        newGrid.ondragstart = function(event){
            event.preventDefault();
        }

        newGrid.ondragenter = function(event){
            hldent(movingBox, newGrid, j);
        };

        newGrid.ondragleave = function(){
            bk(newGrid, defaultBkColor);
        };

        newGrid.ondrop = function(event){
            bk(newGrid, defaultBkColor);
            list.addItem(itemsIdMap[event.dataTransfer.getData("movingItemId")], j);
        };
        newGrid.ondragover = ((event)=> ago(event));

        newGrid.onmousedown = function(){
            if(!mouseMoveStart){
                mouseMoveStart = true;
                gridsIn["startTime"] = hrsToTime(occupiedToHrs(j) + 7);
                gridsIn["startFrom"] = j;
                gridsIn["inList"] = list;
            }
        };
        
        newGrid.onmousemove = function(){
            if(mouseMoveStart & list === gridsIn["inList"]){
                
                let reverse = false;
                if(j < gridsIn["startFrom"]){
                    reverse = true;
                }
                
                for (let i of gridsIn["grids"]){
                    if((!reverse & i > j) | 
                       (reverse & i < j) |
                      (reverse & i > gridsIn["startFrom"]) |
                       (!reverse & i < gridsIn["startFrom"])){
                        list.grids[i].ondragleave();
                    }
                }
                
                
                
                let currentOccupied = 1 + j - gridsIn["startFrom"];
                if(reverse){
                    currentOccupied = 1 + gridsIn["startFrom"] - j;
                }
                let currentHrs = occupiedToHrs(currentOccupied);
                gridsIn["grids"].add(j);
                
                newGrid.style.backgroundColor = chosenGridColor;
                
                if(currentOccupied > mostOccupiedForItem){
                    list.grids[gridsIn["startFrom"]].innerHTML = gridsIn["startTime"] + " too much!";
                }else if(currentOccupied < lessOccupiedForItem){
                    list.grids[gridsIn["startFrom"]].innerHTML = gridsIn["startTime"] + " at least 1hr";
                }else{
                    list.grids[gridsIn["startFrom"]].innerHTML = gridsIn["startTime"] + " hrs: " + currentHrs;
                }
                
            }
        };

        newGrid.onmouseup = function(){
            if(mouseMoveStart  & list === gridsIn["inList"]){
                gridsIn["endAt"] = j;
                initializeGridsIn(list);
                mouseMoveStart = false;
                
                let startFrom = gridsIn["startFrom"];
                let endAt = gridsIn["endAt"];
                if(endAt < startFrom){
                    let m = startFrom;
                    startFrom = endAt;
                    endAt = m;
                }
                
                let tmpOccupied = endAt - startFrom + 1;
                afterMarkOutFromList(tmpOccupied, startFrom, gridsIn["inList"].id);
                
            }else if(mouseMoveStart  & list !== gridsIn["inList"]){
                initializeGridsIn();
                mouseMoveStart = false;
            }
            
        };
        
    };

    var dealWithConflictItem = function(item){
        if(Boolean(uls[0])){
            uls[0].addItem(item);
        }
    };
    
    var changeItemKind = function(item, newKindName){
        let oldKindName = item.kindName;
        
        if(Boolean(newKindName) & newKindName !== oldKindName){
            if(Boolean(item.parentCourse)){
                item.parentCourse.kinds[oldKindName].splice(item.indexInKind, 1);
                item.parentCourse.addKind(newKindName, [item]);
                
                //umm...
                item.parentCourse.updateKind(oldKindName);
                item.parentCourse.updateKind(newKindName);
                item.parentCourse.update();
            }
        }else{
            item.update();
            return false;
        }
    };
    
    var checkItemStatus = function(item){
        let status = "";
        if(Boolean(item.parentList)){
            let timeStartFrom = occupiedToHrs(item.occupiedIndexInList) + 7;
            timeStartFrom = hrsToTime(timeStartFrom);

            let timeEndAt = occupiedToHrs(item.occupiedIndexInList + item.occupied) + 7;
            timeEndAt = hrsToTime(timeEndAt);

            status = item.parentList.elem.id.toUpperCase() + ":&nbsp;" + timeStartFrom + " - " + timeEndAt;
        }else{
            status = "PENDING";
        }
        return status;
    }
    
    
    
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
        
        this.elem.ondragstart = ((t)=> (function(event){
            event.dataTransfer.setData("movingItemId", t.id);
            movingBox = t;
            event.dataTransfer.setDragImage(t.elem, 0, 0);
        }))(this);
    }
    
    ItemObject.prototype.addData = function(obj){
        for (let i of Object.getOwnPropertyNames(obj)){
            this[i] = obj[i];
        }
    }

    
    
    /*
     *  ClassObject, extends from ItemObject but doesnt inherit the prototype chain
     */
    
    function ClassObject(elem, gridHeight, gridClassName, occupied){
        ItemObject.call(this, elem, occupied);
        
        //these are for timetable
        this.nodesInDocument;

        this.grids = new Array();
        for(let i = 0; i < occupied; i++){
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
    
    ClassObject.prototype.update = function(nodeObject){
        //update children nodes of itemObject.elem
        
        if(!Boolean(nodeObject)){
            nodeObject = this.nodesInDocument;
            
        }
        
        var hrs = occupiedToHrs(this.occupied);
        if(hrs > 1){
            hrs += "hrs";
        }else{
            hrs += "hr"
        }
        hrs += " - ";
        
        if("kindName" in nodeObject){
            nodeObject["kindName"].innerHTML = this.kindName;
        }
        if("parentCourseName" in nodeObject){
            nodeObject["parentCourseName"].innerHTML = this.parentCourse.name;
        }
        if("self" in nodeObject){
            nodeObject["self"].style.backgroundColor = this.elem.style.backgroundColor;
        }
        if("subTitle" in nodeObject){
            nodeObject["subTitle"].innerHTML = hrs + this.parentCourse.name;
        }
        
        //for timetable
        if("kindBox" in nodeObject){
            nodeObject["kindBox"].value = this.kindName;
        }
        if("kindIndex" in nodeObject){
            nodeObject["kindIndex"].innerHTML = this.indexInKind + 1;
        }
    }
    
    ClassObject.prototype.format = function(){
        this.elem.style.width = "100%";
        this.elem.style.height = this.occupied * unitHeight+ "px";
        this.elem.style.position = "absolute";
        this.elem.style.top = this.occupiedIndexInList * unitHeight + "px";
    }

    ClassObject.prototype.exportToJsonObj = function(){
        let tmpAry = new Array();
        tmpAry.push(this.occupied);
        if(Boolean(this.parentList)){
            tmpAry.push(this.parentList.indexInLists);
            tmpAry.push(this.occupiedIndexInList);
        }
        return tmpAry;
    }
    
    ClassObject.prototype.addData = function(args){
        if("parentCourse" in args){
            this.parentCourse = args["parentCourse"];
        }
        if("kindName" in args){
            this.kindName = args["kindName"];
        }
        if("indexInKind" in args){
            this.indexInKind = args["indexInKind"];
        }
        if("occupiedIndexInList" in args){
            this.occupiedIndexInList = args["occupiedIndexInList"];
        }
    }
    
    ClassObject.prototype.deleteSelf = function(){
        //I don't know if .deleteSelf() is a good (or acceptable) idea...
        if(Boolean(this.parentList)){
            this.parentList.removeItem(this);
        }
        if(Boolean(this.parentCourse) & Boolean(this.kindName)){
            this.parentCourse.kinds[this.kindName].splice(this.indexInKind, 1);
            this.parentCourse.updateKind(this.kindName);
            this.parentCourse.update();
        }
        this.elem.parentElement.removeChild(this.elem);
    }
    
    
    
    /*
     *  Course(Object)
     */
    
    function Course(elem, name){
        this.elem = elem;
        this.kinds = new Object();
        this.name = name;
        this.kindsCount = 0;
        /*this.mainColor = "rgb(134, 150, 166)";*/
        
        this.id;
        this.nodesInDocument;
    }

    Course.prototype.addKind = function(name, ItemObjectArray){
        for (var i of ItemObjectArray){
            i.addData({"parentCourse": this, "kindName": name});
        }
        if(!Boolean(this.kinds[name.valueOf()])){
            this.kinds[name.valueOf()] = new Array();
        }
        this.kinds[name.valueOf()] = this.kinds[name.valueOf()].concat(ItemObjectArray);
        this.kindsCount += 1;

        this.updateKind(name.valueOf());
        this.update();

        return this.kindsCount;
    } 

    Course.prototype.deleteSelf = function(){
        for (let kind of Object.getOwnPropertyNames(this.kinds)){
            for (let item of this.kinds[kind]){
                item.parentCourse = null;
                item.deleteSelf();
            }
            delete this.kinds[kind];
        }
        
        this.elem.parentNode.removeChild(this.elem);
        delete coursesIdMap[this.id];
    }

    Course.prototype.update = function(nodeObject){
        //update all elements...
        
        if(!Boolean(nodeObject)){
            nodeObject = this.nodesInDocument;
        }
        
        if("courseName" in nodeObject){
            nodeObject["courseName"].innerHTML = this.name;
        }
        if("courseNameBox" in nodeObject){
            nodeObject["courseNameBox"].value = this.name;
        }
        if("kindNames" in nodeObject){
            nodeObject["kindNames"].innerHTML = "";
            for (let i of Object.getOwnPropertyNames(this.kinds)){
                var kindName = i;
                if(kindName.length >= 5){
                    kindName = kindName.slice(0, 4) + "...";
                }
                nodeObject["kindNames"].innerHTML += this.kinds[i].length + " " + kindName + ", ";
            }
        }
    }

    Course.prototype.updateKind = function(kind){
        if(kind in this.kinds){
            if(this.kinds[kind].length === 0){
                delete this.kinds[kind];
            }else{
                for (let i = 0; i < this.kinds[kind].length; i++){
                    this.kinds[kind][i].addData({"indexInKind": i});
                    this.kinds[kind][i].update();
                }
            }
        }
    }


    
    /*
     *  ListObject
     */
    
    function ListObject(elem, gridHeight, gridClassName, n) {
        this.elem = elem;
        this.elem.style.position = "relative";
        this.items = new Array();
        
        this.id;

        for(var i = 0; i < n; i++){
            this.items.push(null);
        }

        this.grids = new Array();
        for(let j = 0; j < n; j++){
            var newGrid = document.createElement("div");
            newGrid.className = gridClassName;
            newGrid.style.height = gridHeight;

            if(Math.floor(j / 4) % 2 === 1){
                newGrid.style.backgroundColor = defaultGridSubColor;
            }
            if(j === n - 1){
                newGrid.style.borderBottomLeftRadius = "12.5px";
                newGrid.style.borderBottomRightRadius = "12.5px";
            }
            this.elem.appendChild(newGrid);

            //eventHandler!
            addFuncForListGrid(newGrid, this, j);

            this.grids.push(newGrid);
        }
    }

    ListObject.prototype.addItem = function(item, n){
        //elem add and obj add

        if(Boolean(item)){
            //add a check of normalList
            var confirmed = true;
            if(n + item.occupied <= this.grids.length){
                for(var i = n; i < n + item.occupied; i++){
                    if(Boolean(this.items[i]) & this.items[i] !== item){
                        confirmed = confirm(confirmMsg);
                        break;
                    }
                }
                if(confirmed){
                    if(Boolean(item.parentList)){
                        item.parentList.removeItem(item);
                    }
                    for(var j = n; j < n + item.occupied; j++){
                        if(this.items[j]){
                            dealWithConflictItem(this.items[j]);
                            this.removeItem(this.items[j]);
                        }
                        this.items[j] = item;
                    }

                    item.parentList = this;
                    item.addData({"occupiedIndexInList": n});

                    addFuncForItemGridsInList(item, this);

                    this.elem.appendChild(item.elem);
                    item.format();
                }
            }else{
                alert(boundReachedMsg);
            }
        }else{
            throw ReferenceError("item can not be null.");
        }
    }

    ListObject.prototype.removeItem = function(item){
        var t = this;
        for (var i = 0; i < t.items.length; i++){
            if(t.items[i] === item){
                t.items[i].parentList = null;
                t.items[i] = null;
            }
        }
    }

    ListObject.prototype.toString = function(){
        return "[ListObject id " + this.elem.id + " items" + this.items.toString() + "]";
    }

    
    function NormalListObject(elem){
        this.elem = elem;
        
        this.elem.ondrop = (function(t){
            return (event) => {
                let movingItem = itemsIdMap[event.dataTransfer.getData("movingItemId")];
                if(Boolean(movingItem.parentList)){
                    movingItem.parentList.removeItem(movingItem);
                }
                t.addItem(itemsIdMap[event.dataTransfer.getData("movingItemId")])
            };
        })(this);
        this.elem.ondragover = function(event){
            event.preventDefault();
        }
    }
    
    NormalListObject.prototype.addItem = function(item, prevItem){
        item.elem.style.position = "relative";
        item.elem.style.top = "0px";
        for(let p = 0; p < item.grids.length; p ++){
            item.grids[p].ondrop = (function(t){
                return (e)=>{
                    let movingItem = itemsIdMap[e.dataTransfer.getData("movingItemId")];
                    if(Boolean(movingItem.parentList)){
                        movingItem.parentList.removeItem(movingItem);
                    }
                    t.addItem(movingItem, item);
                    e.stopPropagation();
                };
            })(this);
            item.grids[p].ondragenter = undefined;
            item.grids[p].ondragover = ((event)=> ago(event));
        }
        if(Boolean(prevItem)){
            this.elem.insertBefore(item.elem, prevItem.elem);
        }else{
            this.elem.insertBefore(item.elem, this.elem.children[0]);
        }
    }
    
    
    //  drag and drop

    function hldent(item, t, j){
        t.innerHTML = hrsToTime(occupiedToHrs(j) + 7) + " - " + hrsToTime(occupiedToHrs(j) + 7 + occupiedToHrs(item.occupied)) + " ..";
        t.style.backgroundColor = chosenGridColor;
    }

    function bk(t, tc){
        t.innerHTML = "";
        t.style.backgroundColor = tc;
    }

    function ago(e){
        e.preventDefault();
    }
    
    
    
    return {
        
        addListFromElem: function(elem, gridClassName, listOccupied){
            var tmpObj = new ListObject(elem, unitHeight, "hld", listOccupied);
            tmpObj.indexInLists = lists.length;
            lists.push(tmpObj);
            tmpObj.id = lists.length - 1;
        },
        
        addNormalListForItems: function(elem){
            let normalList = new NormalListObject(elem);
            uls.push(normalList);
            return uls.length - 1;
        },
        
        exportAllToJsonObj: function(){
            return exportTimetableToJsonObj();
        },
        
        exportCourseToJsonObj: function(courseId){
            if(courseId in coursesIdMap){
                return exportCourseToJsonObj(coursesIdMap[courseId]);
            }
        },
        
        deleteAll: function(except){
            for (let courseId of Object.getOwnPropertyNames(coursesIdMap)){
                coursesIdMap[courseId].deleteSelf();
            }
        },
        
        setChosenCourse: function(course){
            chosenCourse = course;
        },
        
        hrsToOccupied: function(hrs){
            return hrsToOccupied(hrs);
        },

        occupiedToHrs: function(occupied){
            return occupiedToHrs(occupied);
        },

        hrsToTime: function(hrs){
            return hrsToTime(hrs);
        },
        
        buildItem: function(elem, occupied, gridClassName){
            return buildItem(elem, occupied, gridClassName);
        },
        
        changeItemKind: function(itemId, newKindName){
            if(itemId in itemsIdMap){
                changeItemKind(itemsIdMap[itemId], newKindName);
            }
        },
        
        setUpdateNodesOfItem: function(itemId, nodeObject){
            if(itemId in itemsIdMap){
                itemsIdMap[itemId].nodesInDocument = nodeObject;
            }
        },
        
        setUpdateNodesOfCourse: function(courseId, nodeObject){
            if(courseId in coursesIdMap){
                coursesIdMap[courseId].nodesInDocument = nodeObject;
            }
        },
        
        checkItemStatus: function(itemId){
            if(itemId in itemsIdMap){
                return checkItemStatus(itemsIdMap[itemId]);
            }
        },
        
        getUpdateNodeOfItem: function(itemId){
            if(itemId in itemsIdMap){
                let nodesInDocument = itemsIdMap[itemId].nodesInDocument;
                if(Boolean(nodesInDocument)){
                    return nodesInDocument;
                }
            }
        },
        
        updateForItem: function(nodeObject, itemId){
            if(itemId in itemsIdMap){
                itemsIdMap[itemId].update(nodeObject);
            }
        },
        
        getItemElem: function(itemId){
            if(itemId in itemsIdMap){
                return itemsIdMap[itemId].elem;
            }
        },
        
        updateForCourse: function(nodeObject, courseId){
            if(courseId in coursesIdMap){
                coursesIdMap[courseId].update(nodeObject);
            }
        },
        
        deleteObj: function(objId){
            if("item-" == objId.slice(0, 5)){
                if(objId in itemsIdMap){
                    itemsIdMap[objId].deleteSelf();
                    delete itemsIdMap[objId];
                }
            }else if("course-" == objId.slice(0, 7)){
                if(objId in coursesIdMap){
                    coursesIdMap[objId].deleteSelf();
                    delete coursesIdMap[objId];
                }
            }
            
        },
        
        buildCourse: function(elem, name){
            return buildCourse(elem, name);
        },
        
        addItemToList: function(itemId, listId, n){
            if(itemId in itemsIdMap & Boolean(lists[listId])){
                lists[listId].addItem(itemsIdMap[itemId], n);
            }
            
        },
        
        changeItemCourse: function(itemId, newCourseId){
            if(itemId in itemsIdMap & newCourseId in coursesIdMap){
                let item = itemsIdMap[itemId];
                item.parentCourse.kinds[item.kindName].splice(item.indexInKind, 1);
                item.parentCourse.updateKind(item.kindName);
                item.parentCourse.update();
                
                let newCourse = coursesIdMap[newCourseId];
                newCourse.addKind(item.kindName, [item]);
            }
        },
        
        setMarkOutFunc: function(func){
            afterMarkOutFromList = func;
        },
        
        addItemToNormalList: function(itemId, normalListId){
            if(itemId in itemsIdMap){
                uls[normalListId].addItem(itemsIdMap[itemId]);
            }
        },
        
        checkCourseExist: function(name){
            return checkCourseExist(name);
        },
        
        addKindToCourse: function(name, itemIds, courseId){
            if(courseId in coursesIdMap){
                let itemObjs = new Array();
                for (let itemId of itemIds){
                    if(itemId in itemsIdMap){
                        itemObjs.push(itemsIdMap[itemId]);
                    }
                }
                coursesIdMap[courseId].addKind(name, itemObjs);
            }
            
        },
        
        checkCourseExistById: function(courseId){
            return courseId in coursesIdMap;
        },
        
        getCourseName: function(courseId){
            if(courseId in coursesIdMap){
                return coursesIdMap[courseId].name;
            }
        },
        
        setCourseName: function(courseId, newName){
            if(courseId in coursesIdMap){
                if(coursesIdMap[courseId].name !== newName){
                    coursesIdMap[courseId].name = newName;
                    for (let kind of Object.getOwnPropertyNames(coursesIdMap[courseId].kinds)){
                        coursesIdMap[courseId].updateKind(kind);
                    }
                    coursesIdMap[courseId].update();
                }
            }
        },
        
        getItemId: function(courseId, kindName, indexInKind){
            if(courseId in coursesIdMap){
                return coursesIdMap[courseId].kinds[kindName][indexInKind].id;
            }
        }
        
    }
    
})(unitHeight);