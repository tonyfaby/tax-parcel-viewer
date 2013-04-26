/** @license
| Version 10.1.1
| Copyright 2012 Esri
|
| Licensed under the Apache License, Version 2.0 (the "License");
| you may not use this file except in compliance with the License.
| You may obtain a copy of the License at
|
|    http://www.apache.org/licenses/LICENSE-2.0
|
| Unless required by applicable law or agreed to in writing, software
| distributed under the License is distributed on an "AS IS" BASIS,
| WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
| See the License for the specific language governing permissions and
| limitations under the License.
*/
//Get candidate results for searched address
function LocateAddress() {
    if (dojo.byId("txtAddress").value.trim() == '') {
        dojo.byId("imgSearchLoader").style.display = "none";
        RemoveChildren(dojo.byId('tblAddressResults'));
        RemoveChildren(dojo.byId('divAddressHeader'));
        CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
        if (dojo.byId("txtAddress").value != "") {
            alert(messages.getElementsByTagName("blankParcel")[0].childNodes[0].nodeValue);
        }
        return;
    }

    for (var i = 0; i < layers.length; i++) {
        if (layers[i].ParcelQuery) {
            LocateParcelData(layers[i]);
        }
    }
}

//function to findtask operation for parcels
function LocateParcelData(layerInfo) {
    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
    RemoveChildren(dojo.byId('tblAddressResults'));
    RemoveChildren(dojo.byId('divAddressHeader'));
    map.getLayer(tempLayerId).clear();
    var queryTask = new esri.tasks.QueryTask(layerInfo.ServiceURL);
    var query = new esri.tasks.Query();
    query.where = dojo.string.substitute(layerInfo.ParcelQuery, [dojo.byId("txtAddress").value.trim().toUpperCase()]);
    query.returnGeometry = false;
    var outFields = layerInfo.OutFields.split(",");
    var objectIDField = map.getLayer(layerInfo.Key).objectIdField;
    outFields.push(objectIDField);
    query.outFields = outFields;
    queryTask.execute(query, function (featureSet) {
        if (thisSearchTime < lastSearchTime) {
            return;
        }

        if (featureSet.features.length > 0) {
            RemoveChildren(dojo.byId('divAddressHeader'));

            dojo.byId("tblSearchInfo").style.display = "none";
            if (featureSet.features.length == 1) {
                if (isMobileDevice) {
                    HideAddressContainer();
                }
                dojo.byId("txtAddress").value = featureSet.features[0].attributes[layerInfo.DisplayFields[1]];
                lastSearchString = dojo.byId("txtAddress").value.trim();
                LocateParcelonMap(dojo.string.substitute(parcelAttributeID, featureSet.features[0].attributes), null, featureSet.features[0].attributes[map.getLayer(layerInfo.Key).objectIdField]);
            }
            SetHeightAddressResults();

            var tableHeader = document.createElement("table");
            tableHeader.className = "tblSearchHeader";
            var tbodyHeader = document.createElement("tbody");
            tableHeader.appendChild(tbodyHeader);
            var trHeader = document.createElement("tr");
            tbodyHeader.appendChild(trHeader);
            trHeader.className = "trAddressGray";

            var tdParcelId = document.createElement("td");
            trHeader.appendChild(tdParcelId);
            tdParcelId.style.width = "100px";
            tdParcelId.innerHTML = "Parcel ID";

            var spanUp = document.createElement("span");
            spanUp.innerHTML = "&#9650";
            spanUp.id = "spanUp";
            spanUp.style.marginLeft = "10px";
            tdParcelId.appendChild(spanUp);

            var tdAddress = document.createElement("td");
            tdAddress.innerHTML = "Address";
            trHeader.appendChild(tdAddress);

            var spanUpAdd = document.createElement("span");
            spanUpAdd.innerHTML = "&#9650";
            spanUpAdd.id = "spanUpAdd";
            spanUpAdd.style.marginLeft = "10px";
            tdAddress.appendChild(spanUpAdd);

            dojo.byId("divAddressHeader").appendChild(tableHeader);
            var table = dojo.byId("tblAddressResults");
            var tBody = document.createElement("tbody");
            tBody.id = "tBody";
            table.appendChild(tBody);
            var sortableTable = new SortTable(dojo.byId("tblAddressResults"));
            tdParcelId.setAttribute("sortdir", "down");
            tdAddress.setAttribute("sortdir", "down");
            tdParcelId.onclick = function () {
                if (featureSet.features.length > 1) {
                    sortableTable.sort(0, this.getAttribute("sortdir") == "down");
                    if (this.getAttribute("sortdir") == "down") {
                        this.setAttribute("sortdir", "up");
                        dojo.byId("spanUp").innerHTML = "&#9660";
                    }
                    else {
                        this.setAttribute("sortdir", "down");
                        dojo.byId("spanUp").innerHTML = "&#9650";
                    }
                }
                else {
                    return;
                }
            };

            tdAddress.onclick = function () {
                if (featureSet.features.length > 1) {
                    sortableTable.sort(1, this.getAttribute("sortdir") == "down");
                    if (this.getAttribute("sortdir") == "down") {
                        this.setAttribute("sortdir", "up");
                        dojo.byId("spanUpAdd").innerHTML = "&#9660";
                    }
                    else {
                        this.setAttribute("sortdir", "down");
                        dojo.byId("spanUpAdd").innerHTML = "&#9650";
                    }
                }
                else {
                    return;
                }
            };

            for (var i = 0; i < featureSet.features.length; i++) {
                CreateTable(featureSet.features[i].attributes, dojo.byId("tBody"), dojo.byId("tblAddressResults"), parcelAttributeID, layerInfo.DisplayFields, map.getLayer(layerInfo.Key).objectIdField);
            }
            dojo.byId("imgSearchLoader").style.display = "none";
            SetHeightAddressResults();
        }
        else {
            dojo.byId("tblSearchInfo").style.display = "none";
            dojo.byId('txtAddress').focus();
            HideProgressIndicator();
            dojo.byId("imgSearchLoader").style.display = "none";
            QueryErrBack("unableToLocateParcel");
        }
    }, function err() {
        dojo.byId('txtAddress').focus();
        HideProgressIndicator();
        dojo.byId("imgSearchLoader").style.display = "none";
        QueryErrBack("unableToLocateParcel");
    });
}

//This function is called when locator service fails or does not return any data
function QueryErrBack(val) {
    RemoveChildren(dojo.byId('tblAddressResults'));
    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));

    var table = dojo.byId("tblAddressResults");
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);
    table.cellSpacing = 0;
    table.cellPadding = 0;

    var tr = document.createElement("tr");
    tBody.appendChild(tr);
    var td1 = document.createElement("td");
    td1.innerHTML = messages.getElementsByTagName(val)[0].childNodes[0].nodeValue;
    tr.appendChild(td1);
}

//Sort the data in ascending/descending order
function SortTable(table) {
    this.tbody = table.getElementsByTagName('tbody');
    this.thead = table.getElementsByTagName('thead');
    this.tfoot = table.getElementsByTagName('tfoot');

    this.getInnerText = function (el) {
        if (typeof (el.textContent) != 'undefined') return el.textContent;
        if (typeof (el.innerText) != 'undefined') return el.innerText;
        if (typeof (el.innerHTML) == 'string') return el.innerHTML.replace(/<[^<>]+>/g, '');
    }

    this.getParent = function (el, pTagName) {
        if (el == null) return null;
        else if (el.nodeType == 1 && el.tagName.toLowerCase() == pTagName.toLowerCase())
            return el;
        else
            return this.getParent(el.parentNode, pTagName);
    }

    this.sortColumnIndex = null;

    this.sort = function (sortColumnIndex, desc) {
        if (this.tbody[0].rows.length <= 1) {
            return;
        }
        ShowProgressIndicator();
        var itm = this.getInnerText(this.tbody[0].rows[1].cells[sortColumnIndex]);
        this.sortColumnIndex = sortColumnIndex;
        if (itm.match(/\d\d[-]+\d\d[-]+\d\d\d\d/)) sortfn = this.sortDate; // date format mm-dd-yyyy
        if (itm.replace(/^\s+|\s+$/g, "").match(/^[\d\.]+$/)) sortfn = this.sortNumeric;

        var sortfn = this.sortCaseInsensitive;

        var newRows = new Array();
        for (j = 0; j < this.tbody[0].rows.length; j++) {
            newRows[j] = this.tbody[0].rows[j];
        }

        newRows.sort(sortfn);

        if (desc) {
            newRows.reverse();
        }

        for (i = 0; i < newRows.length; i++) {
            this.tbody[0].appendChild(newRows[i]);
        }
        HideProgressIndicator();
        dojo.byId("imgSearchLoader").style.display = "none";
    }

    this.sortCaseInsensitive = dojo.hitch(this, function (a, b) {
        aa = this.getInnerText(a.cells[this.sortColumnIndex]).toLowerCase();
        bb = this.getInnerText(b.cells[this.sortColumnIndex]).toLowerCase();
        if (aa == bb) return 0;
        if (aa < bb) return -1;
        return 1;
    });

    this.sortDate = function (a, b) {
        aa = getInnerText(a.cells[sortColumnIndex]);
        bb = getInnerText(b.cells[sortColumnIndex]);
        date1 = aa.substr(6, 4) + aa.substr(3, 2) + aa.substr(0, 2);
        date2 = bb.substr(6, 4) + bb.substr(3, 2) + bb.substr(0, 2);
        if (date1 == date2) return 0;
        if (date1 < date2) return -1;
        return 1;
    }

    this.sortNumeric = function (a, b) {
        aa = parseFloat(getInnerText(a.cells[sortColumnIndex]));
        if (isNaN(aa)) aa = 0;
        bb = parseFloat(getInnerText(b.cells[sortColumnIndex]));
        if (isNaN(bb)) bb = 0;
        return aa - bb;
    }
}

//Create table for searched data
function CreateTable(attributes, tBody, table, parcelAttributeID, displayFields, objectIDField) {
    map.getLayer(tempLayerId).clear();
    var tr = document.createElement("tr");
    tr.className = "trRowHeight";


    tBody.appendChild(tr);
    tr.setAttribute("parcelId", dojo.string.substitute(parcelAttributeID, attributes));
    tr.setAttribute("objectId", attributes[objectIDField]);

    var td = document.createElement("td");
    for (var index in attributes) {
        if (!attributes[index]) {
            attributes[index] = showNullValueAs;
        }
    }
    var parcelID = attributes[displayFields[0]];
    td.innerHTML = parcelID;
    td.style.width = "100px";
    var td1 = document.createElement("td");
    var postalAddress = attributes[displayFields[1]];
    td1.innerHTML = postalAddress;
    tr.setAttribute("addressValue", postalAddress);
    if (!isMobileDevice) {
        td.className = 'bottomborder';
        td1.className = 'bottomborder';
    }
    tr.onclick = function () {
        dojo.byId("txtAddress").value = this.getAttribute("addressValue");
        lastSearchString = dojo.byId("txtAddress").value.trim();
        dojo.byId('txtAddress').setAttribute("defaultAddress", this.getAttribute("addressValue"));
        dojo.byId("txtAddress").setAttribute("defaultAddressTitle", this.getAttribute("addressValue"));

        tr.className = "selectedAddress";
        if (isMobileDevice) {
            HideAddressContainer();
        }

        dojo.query('.selectedAddress', table).forEach(dojo.hitch(this, function (node, idx, arr) {
            node.bgColor = "";
        }));
        tr.bgColor = selectedAddressColor;
        LocateParcelonMap(this.getAttribute("parcelId"), null, this.getAttribute("objectId"));
    }

    tr.appendChild(td);
    tr.appendChild(td1);
}

//Function for sorting comments according to value
function SortResultFeatures(a, b) {
    var x = a.y;
    var y = b.y;
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

//Locate parcel
function LocateParcel(parcelId, mapPoint, objectId) {
    map.getLayer(tempLayerId).clear();
    dojo.query('.selectedAddress', dojo.byId("tblAddressResults")).forEach(function (node, idx, arr) {
        node.bgColor = "";
    });
    LocateParcelonMap(parcelId, mapPoint, objectId)
}

//Locate parcel on map
function LocateParcelonMap(parcelId, mapPoint, objectId) {
    map.infoWindow.hide();
    selectedGraphic = null;
    dojo.byId('txtSelectedLayout').value = "";
    dojo.byId('txtMapTitle').value = "";
    map.getLayer(tempParcelLayerId).clear();
    for (var i = 0; i < layers.length; i++) {
        QueryParcel(layers[i], parcelId, mapPoint, objectId);
    }
}

//Query parcel for parcel information
function QueryParcel(layer, parcelId, mapPoint, objectId) {   
    if (layer.ParcelQuery) {
        var queryTask = new esri.tasks.QueryTask(layer.ServiceURL);
        var query = new esri.tasks.Query();

        query.outSpatialReference = map.spatialReference;
        query.returnGeometry = false;
        query.outFields = [layer.OutFields];

        if (mapPoint) {
            query.geometry = mapPoint;
        }
        else {
            var relationshipId;
            parcelAttributeID.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key) {
                relationshipId = key;
            });

            query.where = relationshipId + " in ('" + parcelId + "')";
        }
        query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
        ShowProgressIndicator();
        queryTask.execute(query, function (featureSet) {
            if (featureSet.features.length == 0) {
                alert(messages.getElementsByTagName("unableToLocateParcel")[0].childNodes[0].nodeValue);
                HideProgressIndicator();
                return;
            }
            var query1 = new esri.tasks.Query();
            query1.outSpatialReference = map.spatialReference;
            query1.where = dojo.string.substitute(layer.LocateParcelQuery, [dojo.string.substitute(parcelAttributeID, featureSet.features[0].attributes)]);
            query1.returnGeometry = true;
            query1.outFields = ["*"];
            queryTask.execute(query1, function (results) {
                if (results.features.length == 0) {
                    HideProgressIndicator();
                    RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
                    RemoveChildren(dojo.byId("tblAddressResults"));
                    alert(messages.getElementsByTagName("unableToLocateParcel")[0].childNodes[0].nodeValue);
                    return;
                }

                if (!mapPoint) {
                    var polygon = results.features[0].geometry;
                    var mapPoint = polygon.getExtent().getCenter();
                    if (!polygon.contains(mapPoint)) {
                        mapPoint = polygon.getPoint(0, 0);
                    }
                }
             
                if (!isMobileDevice) {
                    if (featureSet.features.length == 1) {
                        dojo.byId("tdList").style.display = "none";
                        AddParcelToMap(results.features[0], mapPoint);
                        PopulateParcelInformation(mapPoint, results.features[0], results.features.length, results.features[0].geometry);
                    }
                    else {
                        AddParcelToMap(results.features[0], mapPoint);
                        ShowParcelList(mapPoint, featureSet.features, results.features[0].geometry, queryTask, layer.LocateParcelQuery);
                        dojo.byId("tdList").onclick = function () {
                            ShowParcelList(mapPoint, featureSet.features, results.features[0].geometry, queryTask, layer.LocateParcelQuery);
                        }
                    }
                }
                else {
                    if (isMobileDevice) {
                        HideProgressIndicator();
                        map.infoWindow.setTitle("");
                        map.infoWindow.setContent("");
                        setTimeout(function () {
                            var screenPoint;
                            selectedGraphic = mapPoint;
                            screenPoint = map.toScreen(mapPoint);
                            screenPoint.y = map.height - screenPoint.y;
                            map.infoWindow.resize(225, 65);
                            map.infoWindow.show(screenPoint);
                            if (featureSet.features.length == 1) {
                                for (var i in results.features[0].attributes) {
                                    if (!results.features[0].attributes[i]) {
                                        results.features[0].attributes[i] = showNullValueAs;
                                    }
                                }

                                map.infoWindow.setTitle(dojo.string.substitute(infoWindowHeader, results.features[0].attributes).trimString(20));
                                map.infoWindow.setContent(dojo.string.substitute(infoWindowContent, results.features[0].attributes));
                            }
                            else {
                                map.infoWindow.setTitle(dojo.string.substitute(featureSet.features.length + " Features found"));
                            }
                            AddParcelToMap(results.features[0], mapPoint);
                            dojo.connect(map.infoWindow.imgDetailsInstance(), "onclick", function () {
                                if (featureSet.features.length == 1) {
                                    ShowProgressIndicator();
                                    PopulateParcelInformation(mapPoint, results.features[0], results.features.length, results.features[0].geometry);
                                }
                                else {
                                    ShowParcelList(mapPoint, featureSet.features, results.features[0].geometry, queryTask, layer.LocateParcelQuery);
                                    dojo.byId("tdList").onclick = function () {
                                        ShowParcelList(mapPoint, featureSet.features, results.features[0].geometry, queryTask, layer.LocateParcelQuery);
                                    }
                                }
                            });
                        });
                    }
                }
            });
        }, function (err) {       
            HideProgressIndicator();
            RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
            RemoveChildren(dojo.byId("tblAddressResults"));
            alert(messages.getElementsByTagName("unableToLocateParcel")[0].childNodes[0].nodeValue);
        });
    }
}

//Plotting parcel on map
function AddParcelToMap(feature, mapPoint) {
    var graphic;
    for (var j = 0; j < layers.length; j++) {
        if (layers[j].ParcelQuery) {
            if (layers[j].UseColor) {
                var lineColor = new dojo.Color();
                lineColor.setColor(layers[j].Color);

                var fillColor = new dojo.Color();
                fillColor.setColor(layers[j].Color);
                fillColor.a = layers[j].Alpha;

                var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, lineColor, 3), fillColor);
                graphic = new esri.Graphic(feature.geometry, symbol, feature.attributes);
            }
        }
    }
    map.getLayer(tempParcelLayerId).add(graphic);
    (isMobileDevice) ? map.setExtent(GetMobileMapExtent(selectedGraphic)) : map.setExtent(GetBrowserMapExtent(mapPoint));
}

//Show parcel list
function ShowParcelList(mapPoint, featureSet, geometry, queryTask, whereCondition) {
    dojo.byId("divParcelDataScrollContainer").style.display = "block";
    dojo.byId("divNeighborhoodContainer").style.display = "none";
    dojo.byId("divBroadbandContainer").style.display = "none";
    dojo.byId("divTabBar").style.display = "none";
    dojo.byId("tdList").style.display = "none";
    RemoveChildren(dojo.byId("divParcelScrollContent"));

    var table = document.createElement("table");
    dojo.byId("divParcelScrollContent").appendChild(table);
    table.id = "tableParcelInfoWindowList";
    table.style.width = "93%";
    table.style.textAlign = "left";
    table.style.overflow = "hidden";
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);

    for (var i = 0; i < featureSet.length; i++) {
        var tr = document.createElement("tr");
        tr.className = "trRowHeight";
        tBody.appendChild(tr);
        var td = document.createElement("td");
        var parcelID = dojo.string.substitute(infoWindowContent, featureSet[i].attributes);
        td.innerHTML = parcelID;
        if (i == 0) {
            selectedParcel = dojo.string.substitute(parcelAttributeID, featureSet[0].attributes);
            dojo.byId("tdParcelId").innerHTML = selectedParcel;
            dojo.byId("tdTaxParcelId").innerHTML = selectedParcel;
        }
        var td1 = document.createElement("td");
        var postalAddress = dojo.string.substitute(infoWindowHeader, featureSet[i].attributes);
        td1.innerHTML = postalAddress;

        td.style.cursor = "pointer";
        td1.style.cursor = "pointer";

        tr.onclick = function () {
            var query1 = new esri.tasks.Query();
            query1.outSpatialReference = map.spatialReference;
            query1.where = dojo.string.substitute(whereCondition, [dojo.string.substitute(parcelAttributeID, featureSet[this.sectionRowIndex].attributes)]);
            query1.returnGeometry = true;
            query1.outFields = ["*"];
            ShowProgressIndicator();
            queryTask.execute(query1, function (results) {
                tr.className = "selectedAddress";
                if (isMobileDevice) {
                    HideAddressContainer();
                }
                PopulateParcelInformation(mapPoint, results.features[0], featureSet.length, geometry);
            });
        }
        tr.appendChild(td);
        tr.appendChild(td1);
        HideProgressIndicator();
    }
    if (!isMobileDevice) {
        map.infoWindow.resize(330, 270);
        map.infoWindow.setTitle("");
        selectedGraphic = mapPoint;
        var screenPoint = map.toScreen(mapPoint);
        screenPoint.y = map.height - screenPoint.y;
        map.infoWindow.show(screenPoint);
        dojo.byId('tdInfoHeader').innerHTML = featureSet.length + " Features found at this location.";
        map.infoWindow.reSetLocation(screenPoint);
        dojo.byId('divParcelInfoWindow').style.display = "block";
        SetHeightParcelData();
    }
    else {
        screenPoint = map.toScreen(mapPoint);
        dojo.byId('divParcelInformation').style.display = "block";
        dojo.replaceClass("divParcelInformation", "opacityShowAnimation", "opacityHideAnimation");
        dojo.addClass("divParcelInformation", "divParcelInformation");
        dojo.replaceClass("divParcelInfoWindow", "showContainer", "hideContainer");
        dojo.addClass("divParcelInfoWindow", "divParcelInfoWindow");
        dojo.byId('tdInfoHeader').innerHTML = featureSet.length + " Features found at this location.";
        SetHeightParcelData();
    }
}

//Set height and create scrollbar for address results
function SetHeightAddressResults() {
    var height = (isMobileDevice) ? dojo.window.getBox().h - 150 : map.height - 55;
    if (!isMobileDevice) {
        dojo.byId('divAddressScrollContent').style.height = (height - 120) + "px";
    }
    else {
        dojo.byId('divAddressScrollContent').style.height = height + "px";
    }
    setTimeout(function () {
        CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
    }, 500)

}

//Set height for parcel data container
function SetHeightParcelData() {
    var height = (isMobileDevice) ? dojo.window.getBox().h : dojo.coords(dojo.byId('divParcelScrollContent')).h;

    if (isMobileDevice) {
        dojo.byId('divParcelDataScrollContainer').style.height = (height - 105) + "px";
        dojo.byId('divNeighborhoodContainer').style.height = (height - 105) + "px";
        dojo.byId('divBroadbandContainer').style.height = (height - 105) + "px";
    }
    setTimeout(function () {
        CreateScrollbar(dojo.byId("divParcelDataScrollContainer"), dojo.byId("divParcelScrollContent"));
        CreateScrollbar(dojo.byId("divBroadbandContainer"), dojo.byId("divBroadbandContent"));
        CreateScrollbar(dojo.byId("divNeighborhoodContainer"), dojo.byId("divNeighborhoodContent"));
    }, 1000);
}

//Display the infoWindow for parcel
function ShowParcelInfoWindow(attributes, mapPoint, parcelId) {
    RemoveScrollBar(dojo.byId('divFeatureDataScrollbarContainer'));
    RemoveChildren(dojo.byId('divFeatureDataScrollbarContent'));
    dojo.byId("divTabBar").style.display = "block";
    RemoveChildren(dojo.byId("divParcelScrollContent"));
    var table = document.createElement("table");
    dojo.byId("divParcelScrollContent").appendChild(table);
    table.id = "tableParcelInfoWindowData";
    table.style.width = "95%";
    table.style.textAlign = "left";
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    for (var i = 0; i < layers.length; i++) {
        if (layers[i].ParcelQuery) {
            var parcelInfoWindowFields = layers[i].Fields;

            for (var index in parcelInfoWindowFields) {
                var tr = document.createElement("tr");
                tbody.appendChild(tr);
                var td = document.createElement("td");
                td.className = "tdParcelDisplayText"
                td.innerHTML = parcelInfoWindowFields[index].DisplayText;
                var td1 = document.createElement("td");
                td1.className = "tdWordBreak";
                if (parcelInfoWindowFields[index].isLink) {
                    var parcelLink = document.createElement("a");
                    parcelLink.style.color = '#ffffff';
                    parcelLink.setAttribute("target", "_blank");
                    parcelLink.setAttribute("href", dojo.string.substitute(parcelInfoWindowFields[index].href, attributes));
                    parcelLink.appendChild(document.createTextNode(dojo.string.substitute(parcelInfoWindowFields[index].FieldName, attributes)));
                    td1.appendChild(parcelLink);
                }
                else {
                    var value = dojo.string.substitute(parcelInfoWindowFields[index].FieldName, attributes);
                    if (value.endsWith(showNullValueAs)) {
                        td1.innerHTML = showNullValueAs;
                    }
                    else if (parcelInfoWindowFields[index].DataType == "double") {
                        var formattedValue = dojo.number.format(value, { pattern: "#,##0.##" });
                        td1.innerHTML = currency + " " + formattedValue;
                    }
                    else {
                        td1.innerHTML = value;
                    }
                }

                tr.appendChild(td);
                tr.appendChild(td1);
            }
        }
    }

    var screenPoint;
    dojo.byId('tdInfoHeader').innerHTML = dojo.string.substitute(infoWindowHeader, attributes).trimString(40);
    (isMobileDevice) ? map.setExtent(GetMobileMapExtent(selectedGraphic)) : map.setExtent(GetBrowserMapExtent(mapPoint));
    setTimeout(function () {
        if (isMobileDevice) {
            screenPoint = map.toScreen(mapPoint);
            dojo.byId('divParcelInformation').style.display = "block";
            dojo.replaceClass("divParcelInformation", "opacityShowAnimation", "opacityHideAnimation");
            dojo.addClass("divParcelInformation", "divParcelInformation");
            dojo.replaceClass("divParcelInfoWindow", "showContainer", "hideContainer");
            dojo.addClass("divParcelInfoWindow", "divParcelInfoWindow");
        }
        else {
            map.infoWindow.resize(330, 270);
            map.infoWindow.setTitle("");
            selectedGraphic = mapPoint;
            screenPoint = map.toScreen(mapPoint);
            screenPoint.y = map.height - screenPoint.y;
            map.infoWindow.show(screenPoint);
            map.infoWindow.reSetLocation(screenPoint);
            dojo.byId('divParcelInfoWindow').style.display = "block";
        }
        SetHeightParcelData();
    }, 100);
}

String.prototype.endsWith = function (s) {
    return this.length >= s.length && this.substr(this.length - s.length) == s;
}

//Populate parcel information
function PopulateParcelInformation(mapPoint, feature, featureLength, geometry) {
    selectedParcel = dojo.string.substitute(parcelAttributeID, feature.attributes);
    selectedFeature = feature;
    dojo.byId("tdParcelId").innerHTML = selectedParcel;
    dojo.byId("tdTaxParcelId").innerHTML = selectedParcel;
    if (featureLength > 1) {
        dojo.byId("tdList").style.display = "block";
    }
    for (var i in neighbourHoodLayerInfo) {
        if (map.getLayer(neighbourHoodLayerInfo[i].id).maxScale <= ((mapScale) ? mapScale : Number(dojo.byId("divShareContainer").getAttribute("mapScale"))) && map.getLayer(neighbourHoodLayerInfo[i].id).minScale >= ((mapScale) ? mapScale : Number(dojo.byId("divShareContainer").getAttribute("mapScale")))) {
            PopulateNeighbourHoodInformation(neighbourHoodLayerInfo[i], mapPoint, null);
        }
    }
    dijit.byId("divProperty").select();
    ShowPropertyOnStart();
    selectedGraphic = geometry.getExtent().getCenter();
    geometryService.project([selectedGraphic], new esri.SpatialReference({ wkid: 4326 }), function (newPoint) {
        var point = newPoint[0];
        var location = { "latitude": point.y, "longitude": point.x };
        for (var i = 0; i < broadBandService.length; i++) {
            PopulateBroadBandInformation(broadBandService[i], location, null, false);
        }
    });

    if (!isMobileDevice) {
        dojo.byId("divFeatureInformation").style.display = "none";
        dojo.byId("divParcelInformation").style.display = "block";
    }
    for (var index in feature.attributes) {
        if (!feature.attributes[index]) {
            feature.attributes[index] = showNullValueAs;
        }
    }
    ShowParcelInfoWindow(feature.attributes, mapPoint, null);
    FixTabWidth();
}