/** @license
 | Version 10.2
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
var isOrientationChanged = false; //variable to store the flag on orientation
var tinyResponse; //variable to store the response getting from tiny url api
var tinyUrl; //variable to store the tiny url
var popupWin; //variable to store the paypal popup window object
var taxLayerCount = 0; //variable to store the info layers count

//Handles orientation change event
function OrientationChanged() {
    map.infoWindow.hide();
    if (map) {
        isOrientationChanged = true;
        var timeout = (isMobileDevice && isiOS) ? 100 : 500;
        map.reposition();
        map.resize();
        if (isMobileDevice) {
            dojo.byId('divTabBar').style.display = "none";
        }
        setTimeout(function () {
            if (isMobileDevice) {
                SetHeightAddressResults();
                SetHeightParcelData();
                SetHeightSplashScreen();
                SetHeightFeatureData();
                FixTabWidth();
                setTimeout(function () {
                    if (selectedGraphic) {
                        map.setExtent(GetMobileMapExtent(selectedGraphic));
                    }
                    isOrientationChanged = false;
                }, 500);

            }
            else {
                SetHeightAddressResults();
                setTimeout(function () {
                    if (selectedGraphic) {
                        map.setExtent(GetBrowserMapExtent(selectedGraphic));
                    }
                    SetHeightParcelData();
                    isOrientationChanged = false;
                }, 500);
            }
        }, timeout);
    }
}

//Handle resize browser event handler
function resizeHandler() {
    if (map) {
        map.reposition();
        map.resize();
    }
}

//function to fix tab width
function FixTabWidth() {
    if (isMobileDevice) {
        setTimeout(function () {
            dojo.byId('divTabBar').style.display = "block";
            var tabWidth = Math.round(dojo.window.getBox().w / 3);
            dojo.byId('divTabBar').style.width = Math.round((dojo.window.getBox().w - 20)) + "px";
            dojo.query('.mblTabButton', dojo.byId('divTabBar')).forEach(function (node, idx, arr) {
                node.style.width = (tabWidth - 14) + "px";
            });
        }, 1000);
    }
}

//Get the extent based on the mappoint for mobile devices
function GetMobileMapExtent(mapPoint) {
    var extent;
    if (map.getLayer(tempParcelLayerId).graphics.length > 0) {
        extent = map.getLayer(tempParcelLayerId).graphics[0].geometry.getExtent().expand(4);
    }
    else {
        extent = map.extent;
    }
    var width = extent.getWidth();
    var height = extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 6);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Get the extent based on the mappoint
function GetBrowserMapExtent(mapPoint) {
    // Added code to Zoom to selected Parcel
    // David Wray
    var extent;
    if (map.getLayer(tempParcelLayerId).graphics.length > 0) {
        extent = map.getLayer(tempParcelLayerId).graphics[0].geometry.getExtent().expand(6);
    }
    else {
        extent = map.extent;
    }
    var width = extent.getWidth();
    var height = extent.getHeight();
    var xmin = mapPoint.x - ((2 * width) / 2.8);
    var ymin = mapPoint.y - (height / 4);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Get the extent based on the mappoint
function GetPDFMapExtent(mapPoint) {
    var extent;
    if (map.getLayer(tempParcelLayerId).graphics.length > 0) {
        extent = map.getLayer(tempParcelLayerId).graphics[0].geometry.getExtent().expand(6);
    }
    else {
        extent = map.extent;
    }
    var width = extent.getWidth();
    var height = extent.getHeight();
    var xmin = mapPoint.x - ((2 * width) / 3.8);
    var ymin = mapPoint.y - (height / 2);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Animate basemap switcher
function ShowBaseMaps() {
    if (dojo.hasClass('divShareContainer', "showContainerHeight")) {
        dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divShareContainer').style.height = '0px';
    }
    var cellHeight = (isMobileDevice) ? 10 : 115;

    if (dojo.hasClass('divLayerContainer', "showContainerHeight")) {
        dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divLayerContainer').style.height = '0px';
    }
    else {
        if (isMobileDevice) {
            dojo.byId('divLayerContainer').style.height = Math.ceil(baseMapLayers.length / 2) * cellHeight + Math.ceil(layers.length / 2) * 50 + "px";
        }
        else {
            dojo.byId('divLayerContainer').style.height = Math.ceil(baseMapLayers.length / 2) * cellHeight + Math.ceil(layers.length / 2) * 25 + "px";
        }
        dojo.replaceClass("divLayerContainer", "showContainerHeight", "hideContainerHeight");
    }
}

//Get current map Extent
function GetMapExtent() {
    var extents = Math.round(map.extent.xmin).toString() + "," + Math.round(map.extent.ymin).toString() + "," +
                  Math.round(map.extent.xmax).toString() + "," + Math.round(map.extent.ymax).toString();
    return (extents);
}

//Function to open login page for facebook,tweet,email
function ShareLink(ext) {
    tinyUrl = null;
    var mapExtent = GetMapExtent();

    var url = esri.urlToObject(window.location.toString());
    var urlStr = encodeURI(url.path) + "?extent=" + mapExtent;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].ParcelQuery) {
            if (map.getLayer(tempParcelLayerId).graphics.length > 0) {
                urlStr = encodeURI(url.path) + "?parcelId=" + dojo.string.substitute(parcelAttributeID, map.getLayer(tempParcelLayerId).graphics[0].attributes);
            }
        }
    }
    url = dojo.string.substitute(mapSharingOptions.TinyURLServiceURL, [urlStr]);

    dojo.io.script.get({
        url: url,
        callbackParamName: "callback",
        load: function (data) {
            tinyResponse = data;
            tinyUrl = data;
            var attr = mapSharingOptions.TinyURLResponseAttribute.split(".");
            for (var x = 0; x < attr.length; x++) {
                tinyUrl = tinyUrl[attr[x]];
            }
            if (ext) {
                if (dojo.coords("divLayerContainer").h > 0) {
                    dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
                    dojo.byId('divLayerContainer').style.height = '0px';
                }

                var cellHeight = (isMobileDevice || isTablet) ? 81 : 60;
                if (dojo.coords("divShareContainer").h > 0) {
                    dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
                    dojo.byId('divShareContainer').style.height = '0px';
                }
                else {
                    dojo.byId('divShareContainer').style.height = cellHeight + "px";
                    dojo.replaceClass("divShareContainer", "showContainerHeight", "hideContainerHeight");
                }
            }
        },
        error: function (error) {
            alert(tinyResponse.error);
        }
    });
    setTimeout(function () {
        if (!tinyResponse) {
            alert(messages.getElementsByTagName("tinyResponseError")[0].childNodes[0].nodeValue);
            return;
        }
    }, 6000);
}

//Function to open login page for facebook,tweet,email
function Share(site) {
    if (dojo.hasClass('divShareContainer', "showContainerHeight")) {
        dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divShareContainer').style.height = '0px';
    }
    if (tinyUrl) {
        switch (site) {
            case "facebook":
                window.open(dojo.string.substitute(mapSharingOptions.FacebookShareURL, [tinyUrl]));
                break;
            case "twitter":
                window.open(dojo.string.substitute(mapSharingOptions.TwitterShareURL, [tinyUrl]));
                break;
            case "mail":
                parent.location = dojo.string.substitute(mapSharingOptions.ShareByMailLink, [tinyUrl]);
                break;
        }
    }
    else {
        alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
        return;
    }
}

//Hide splash screen container
function HideSplashScreenMessage() {
    if (dojo.isIE < 9) {
        dojo.byId("divSplashScreenDialog").style.display = "none";
    }
    dojo.addClass('divSplashScreenContainer', "opacityHideAnimation");
    dojo.replaceClass("divSplashScreenDialog", "hideContainer", "showContainer");
    window.onkeydown = null;
    dojo.byId('txtAddress').readOnly = false;

    // Identify the key presses while implementing auto-complete and assign appropriate actions
    dojo.connect(dojo.byId("txtAddress"), 'onkeyup', function (evt) {
        if (evt) {
            if (evt.keyCode == dojo.keys.ENTER) {
                if (dojo.byId("txtAddress").value != '') {
                    LocateAddress();
                    return;
                }
            }

            if ((!((evt.keyCode >= 46 && evt.keyCode < 58) || (evt.keyCode > 64 && evt.keyCode < 91) || (evt.keyCode > 95 && evt.keyCode < 106) || evt.keyCode == 8 || evt.keyCode == 110 || evt.keyCode == 188)) || (evt.keyCode == 86 && evt.ctrlKey) || (evt.keyCode == 88 && evt.ctrlKey)) {
                evt = (evt) ? evt : event;
                evt.cancelBubble = true;
                if (evt.stopPropagation) evt.stopPropagation();
                return;
            }
            if (dojo.byId("txtAddress").value.trim() != '') {
                if (lastSearchString != dojo.byId("txtAddress").value.trim()) {
                    lastSearchString = dojo.byId("txtAddress").value.trim();
                    RemoveChildren(dojo.byId('tblAddressResults'));

                    // Clear any staged search
                    clearTimeout(stagedSearch);

                    if (dojo.byId("txtAddress").value.trim().length > 0) {
                        // Stage a new search, which will launch if no new searches show up
                        // before the timeout
                        stagedSearch = setTimeout(function () {
                            dojo.byId("imgSearchLoader").style.display = "block";
                            LocateAddress();
                        }, 500);
                    }
                }
            }
            else {
                lastSearchString = dojo.byId("txtAddress").value.trim();
                dojo.byId("imgSearchLoader").style.display = "none";
                RemoveChildren(dojo.byId('divAddressHeader'));
                RemoveChildren(dojo.byId('tblAddressResults'));
                CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
            }
        }
    });

    dojo.connect(dojo.byId("txtAddress"), 'onpaste', function (evt) {
        setTimeout(function () {
            LocateAddress();
        }, 100);
    });

    dojo.connect(dojo.byId("txtAddress"), 'oncut', function (evt) {
        setTimeout(function () {
            LocateAddress();
        }, 100);
    });
}

//Set height for splash screen
function SetHeightSplashScreen() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 110) : (dojo.coords(dojo.byId('divSplashScreenDialog')).h - 80);
    dojo.byId('divSplashContent').style.height = (height + 10) + "px";
    CreateScrollbar(dojo.byId("divSplashContainer"), dojo.byId("divSplashContent"));
}

//Show progress indicator
function ShowProgressIndicator(nodeId) {
    dojo.byId('divLoadingIndicator').style.display = "block";
}

//Hide progress indicator
function HideProgressIndicator() {
    dojo.byId('divLoadingIndicator').style.display = "none";
    if (isMobileDevice) {
        if (map) {
            var ext = map.extent;
            ext.xmin = (map.extent.xmin + 2);
            map.setExtent(ext);
            map.resize();
            map.reposition();
        }
    }
}

//Current location
function ShowMyLocation() {
    map.getLayer(tempLayerId).clear();
    navigator.geolocation.getCurrentPosition(
        function (position) {
            ShowProgressIndicator('map');
            var mapPoint = new esri.geometry.Point(position.coords.longitude, position.coords.latitude, new esri.SpatialReference({ wkid: 4326 }));
            var graphicCollection = new esri.geometry.Multipoint(new esri.SpatialReference({ wkid: 4326 }));
            graphicCollection.addPoint(mapPoint);
            geometryService.project([graphicCollection], map.spatialReference, function (newPointCollection) {
                HideProgressIndicator();

                if (!map.getLayer(layers[0].Key).fullExtent.contains(newPointCollection[0].getPoint(0))) {
                    alert(messages.getElementsByTagName("outsideArea")[0].childNodes[0].nodeValue);
                    return;
                }
                mapPoint = newPointCollection[0].getPoint(0);
                map.centerAt(mapPoint);
                var symbol = new esri.symbol.PictureMarkerSymbol(geolocatedImage, 25, 25);
                var graphic = new esri.Graphic(mapPoint, symbol, null, null);
                map.getLayer(tempLayerId).add(graphic);
                LocateParcelonMap(null, mapPoint);
            });
        },
        function (error) {
            HideProgressIndicator();
            switch (error.code) {
                case error.TIMEOUT:
                    alert(messages.getElementsByTagName("timeOut")[0].childNodes[0].nodeValue);
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert(messages.getElementsByTagName("positionUnavailable")[0].childNodes[0].nodeValue);
                    break;
                case error.PERMISSION_DENIED:
                    alert(messages.getElementsByTagName("permissionDenied")[0].childNodes[0].nodeValue);
                    break;
                case error.UNKNOWN_ERROR:
                    alert(messages.getElementsByTagName("unknownError")[0].childNodes[0].nodeValue);
                    break;
            }
        }, { timeout: 5000 });
}

//Get the query string value of the provided key if not found the function returns empty string
function GetQuerystring(key) {
    var _default;
    if (_default == null) _default = "";
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (qs == null)
        return _default;
    else
        return qs[1];
}

//Convert string to bool
String.prototype.bool = function () {
    return (/^true$/i).test(this);
};

//Trim string
String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); }

//Append ... for a string
String.prototype.trimString = function (len) {
    return (this.length > len) ? this.substring(0, len) + "..." : this;
}

//Create dynamic scrollbar within container for target content
var scrolling = false; //flag to detect is touchmove event scrolling div

function CreateScrollbar(container, content) {
    var yMax;
    var pxLeft, pxTop, xCoord, yCoord;
    var scrollbar_track;
    var isHandleClicked = false;
    this.container = container;
    this.content = content;
    content.scrollTop = 0;
    if (dojo.byId(container.id + 'scrollbar_track')) {
        RemoveChildren(dojo.byId(container.id + 'scrollbar_track'));
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
    if (!dojo.byId(container.id + 'scrollbar_track')) {
        scrollbar_track = document.createElement('div');
        scrollbar_track.id = container.id + "scrollbar_track";
        scrollbar_track.className = "scrollbar_track";
    }
    else {
        scrollbar_track = dojo.byId(container.id + 'scrollbar_track');
    }

    var containerHeight = dojo.coords(container);
    if (containerHeight.h > 0) {
        scrollbar_track.style.height = (containerHeight.h - 6) + "px";
    }
    else {
        scrollbar_track.style.height = (containerHeight.h) + "px";
    }
    scrollbar_track.style.right = 0 + 'px';

    var scrollbar_handle = document.createElement('div');
    scrollbar_handle.className = 'scrollbar_handle';
    scrollbar_handle.id = container.id + "scrollbar_handle";

    scrollbar_track.appendChild(scrollbar_handle);
    container.appendChild(scrollbar_track);

    if (content.scrollHeight <= content.offsetHeight) {
        scrollbar_handle.style.display = 'none';
        scrollbar_track.style.display = 'none';
        return;
    }
    else {
        scrollbar_handle.style.display = 'block';
        scrollbar_track.style.display = 'block';
        scrollbar_handle.style.height = Math.max(this.content.offsetHeight * (this.content.offsetHeight / this.content.scrollHeight), 25) + 'px';
        yMax = this.content.offsetHeight - scrollbar_handle.offsetHeight;
        yMax = yMax - 5; //for getting rounded bottom of handel
        if (window.addEventListener) {
            content.addEventListener('DOMMouseScroll', ScrollDiv, false);
        }

        content.onmousewheel = function (evt) {
            console.log(content.id);
            ScrollDiv(evt);
        }
    }

    function ScrollDiv(evt) {
        var evt = window.event || evt //equalize event object
        var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
        pxTop = scrollbar_handle.offsetTop;

        if (delta <= -120) {
            var y = pxTop + 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
        else {
            var y = pxTop - 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = (y - 2) + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    }

    //Attaching events to scrollbar components
    scrollbar_track.onclick = function (evt) {
        if (!isHandleClicked) {
            evt = (evt) ? evt : event;
            pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
            var offsetY;
            if (!evt.offsetY) {
                var coords = dojo.coords(evt.target);
                offsetY = evt.layerY - coords.t;
            }
            else
                offsetY = evt.offsetY;
            if (offsetY < scrollbar_handle.offsetTop) {
                scrollbar_handle.style.top = offsetY + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            }
            else if (offsetY > (scrollbar_handle.offsetTop + scrollbar_handle.clientHeight)) {
                var y = offsetY - scrollbar_handle.clientHeight;
                if (y > yMax) y = yMax // Limit vertical movement
                if (y < 0) y = 0 // Limit vertical movement
                scrollbar_handle.style.top = y + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            }
            else {
                return;
            }
        }
        isHandleClicked = false;
    };

    //Attaching events to scrollbar components
    scrollbar_handle.onmousedown = function (evt) {
        isHandleClicked = true;
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) evt.stopPropagation();
        pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
        yCoord = evt.screenY // Vertical mouse position at start of slide.
        document.body.style.MozUserSelect = 'none';
        document.body.style.userSelect = 'none';
        document.onselectstart = function () {
            return false;
        }
        document.onmousemove = function (evt) {
            evt = (evt) ? evt : event;
            evt.cancelBubble = true;
            if (evt.stopPropagation) evt.stopPropagation();
            var y = pxTop + evt.screenY - yCoord;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = (y - 2) + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    };

    document.onmouseup = function () {
        document.body.onselectstart = null;
        document.onmousemove = null;
    };

    scrollbar_handle.onmouseout = function (evt) {
        document.body.onselectstart = null;
    };

    var startPos;
    var scrollingTimer;

    dojo.connect(container, "touchstart", function (evt) {
        touchStartHandler(evt);
    });

    dojo.connect(container, "touchmove", function (evt) {
        touchMoveHandler(evt);
    });

    dojo.connect(container, "touchend", function (evt) {
        touchEndHandler(evt);
    });

    //Handlers for Touch Events
    function touchStartHandler(e) {
        startPos = e.touches[0].pageY;
    }

    function touchMoveHandler(e) {
        var touch = e.touches[0];
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        e.preventDefault();

        pxTop = scrollbar_handle.offsetTop;
        var y;
        if (startPos > touch.pageY) {
            y = pxTop + 10;
        }
        else {
            y = pxTop - 10;
        }

        //setting scrollbar handel
        if (y > yMax) y = yMax // Limit vertical movement
        if (y < 0) y = 0 // Limit vertical movement
        scrollbar_handle.style.top = y + "px";

        if (y == 0) {
            content.scrollTop = 0;
        }
        else {
            //setting content position
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
        scrolling = true;
        startPos = touch.pageY;
    }

    function touchEndHandler(e) {
        scrollingTimer = setTimeout(function () { clearTimeout(scrollingTimer); scrolling = false; }, 100);
    }
    //touch scrollbar end
}

//Remove child elements from a container
function RemoveChildren(parentNode) {
    while (parentNode.hasChildNodes()) {
        parentNode.removeChild(parentNode.lastChild);
    }
}

//Remove scroll bar
function RemoveScrollBar(container) {
    if (dojo.byId(container.id + 'scrollbar_track')) {
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
}

//Display feedback container
function ShowFeedback() {
    dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divShareContainer').style.height = '0px';
    dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divLayerContainer').style.height = '0px';
    dojo.byId("divAddressSearch").style.display = "none";
    dojo.byId("divFeedback").style.display = "block";
    dojo.byId("divCreatePropertyReport").style.display = "none";
    dojo.byId("divShoppingCart").style.display = "none";
    ResetFeedBackValues();
}

//Populate shopping cart information
function ShowShoppingCartContainer() {
    dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divShareContainer').style.height = '0px';
    dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divLayerContainer').style.height = '0px';
    if (pdfData.isEmpty) {
        alert(messages.getElementsByTagName("createPropertyReportOrMap")[0].childNodes[0].nodeValue);
        return;
    }
    var table;
    var tbody;
    if (dojo.query("table", dojo.byId('divItemsContent')).length > 0) {
        table = dojo.query("table", dojo.byId('divItemsContent'))[0];
        tbody = dojo.query("tbody", table)[0];
    }
    else {
        table = document.createElement("table");
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
        dojo.byId('divItemsContent').appendChild(table);
    }
    RemoveChildren(dojo.byId("divShoppingSummary"));

    var totalPrice = 0;
    for (var parcelId in pdfData) {
        for (var reportType in pdfData[parcelId]) {
            if (pdfData[parcelId][reportType].addedToCart) {
                dojo.query('img[parcelId = "' + parcelId + '"][reportType = "' + reportType + '"]').forEach(function (node, index, arr) {
                    if (node.getAttribute("state") == "check") {
                        totalPrice += (reportType == 'PropertyReport') ? propertyReportPrice : propertyMapPrice;
                    }
                });
                continue;
            }
            var tr = document.createElement("tr");
            tbody.appendChild(tr);

            var td = document.createElement("td");
            var checkbox = CreateShoppingCheckBox(parcelId, reportType, true);

            checkbox.onclick = function () {
                var itemsSelected = Number(dojo.byId("tdItems").innerHTML);
                var totalPrice = Number(dojo.byId("tdTPrice").innerHTML.split(" ")[1]);
                var rType = this.getAttribute("reportType");
                if (this.getAttribute("state") == "check") {
                    dojo.byId("chkSelectAll").src = "images/unchecked.png";
                    dojo.byId("chkSelectAll").setAttribute("state", "uncheck");

                    this.src = "images/unchecked.png";
                    this.setAttribute("state", "uncheck");
                    itemsSelected--;
                    totalPrice -= (rType == 'PropertyReport') ? propertyReportPrice : propertyMapPrice;
                }
                else {
                    this.src = "images/checked.png";
                    this.setAttribute("state", "check");

                    var checkedItems = dojo.query('img[state = "check"]', dojo.byId('divItemsContent'));
                    var allItems = dojo.query('img[state]', dojo.byId('divItemsContent'));
                    if (checkedItems.length == allItems.length) {
                        dojo.byId("chkSelectAll").src = "images/checked.png";
                        dojo.byId("chkSelectAll").setAttribute("state", "check");
                    }
                    itemsSelected++;
                    totalPrice += (rType == 'PropertyReport') ? propertyReportPrice : propertyMapPrice;
                }

                dojo.byId("tdItems").innerHTML = itemsSelected;
                dojo.byId("tdTPrice").innerHTML = currency + " " + totalPrice;
                var checkedItems = dojo.query('img[state = "check"]', dojo.byId('divItemsContent'));
                if (checkedItems.length == 0) {
                    dojo.byId("imgPaypal").src = "images/disabledPayPal.gif";
                    dojo.byId("imgPaypal").style.cursor = "default";
                }
                else {
                    dojo.byId("imgPaypal").style.cursor = "pointer";
                    dojo.byId("imgPaypal").src = "images/payPal.png"
                }
            };

            totalPrice += (reportType == 'PropertyReport') ? propertyReportPrice : propertyMapPrice;

            td.appendChild(checkbox);
            var tdParcelId = document.createElement("td");
            tdParcelId.innerHTML = pdfData[parcelId][reportType].ReportDescription;
            tr.appendChild(td);
            tr.appendChild(tdParcelId);
            pdfData[parcelId][reportType].addedToCart = true;
        }
    }

    var tableSummary = document.createElement("table");
    var tbodySummary = document.createElement("tbody");
    tableSummary.appendChild(tbodySummary);
    var trUnitPrice = document.createElement("tr");
    tbodySummary.appendChild(trUnitPrice);
    var tdUnitPrice = document.createElement("td");
    tdUnitPrice.align = "left";
    tdUnitPrice.innerHTML = "Per Unit Price:";
    var tdPrice = document.createElement("td");

    tdPrice.innerHTML = currency + " " + propertyReportPrice;
    trUnitPrice.appendChild(tdUnitPrice);
    trUnitPrice.appendChild(tdPrice);

    if (propertyReportPrice != propertyMapPrice) {
        tdUnitPrice.innerHTML = "Proterty Report Price";

        var trUnitPrice1 = document.createElement("tr");
        tbodySummary.appendChild(trUnitPrice1);
        var tdUnitPrice1 = document.createElement("td");
        tdUnitPrice1.innerHTML = "Property Map Price:";
        var tdPrice1 = document.createElement("td");

        tdPrice1.innerHTML = currency + " " + propertyMapPrice;
        trUnitPrice1.appendChild(tdUnitPrice1);
        trUnitPrice1.appendChild(tdPrice1);
    }

    var trItemsSelected = document.createElement("tr");
    tbodySummary.appendChild(trItemsSelected);
    var tdItemsSelected = document.createElement("td");
    tdItemsSelected.innerHTML = "Items Selected:";
    tdItemsSelected.align = "left";

    var tdItems = document.createElement("td");
    tdItems.id = "tdItems";
    tdItems.innerHTML = dojo.query('img[state = "check"]', dojo.byId('divItemsContent')).length;

    trItemsSelected.appendChild(tdItemsSelected);
    trItemsSelected.appendChild(tdItems);

    var trTotalPrice = document.createElement("tr");
    tbodySummary.appendChild(trTotalPrice);
    var tdTotalPrice = document.createElement("td");
    tdTotalPrice.innerHTML = "Total Price:";
    tdTotalPrice.align = "left";

    var tdTPrice = document.createElement("td");
    tdTPrice.id = "tdTPrice";
    tdTPrice.innerHTML = currency + " " + totalPrice;

    trTotalPrice.appendChild(tdTotalPrice);
    trTotalPrice.appendChild(tdTPrice);

    dojo.byId("divShoppingSummary").appendChild(tableSummary);

    dojo.byId("divAddressSearch").style.display = "none";
    dojo.byId("divFeedback").style.display = "none";
    dojo.byId("divCreatePropertyReport").style.display = "none";
    dojo.byId("divShoppingCart").style.display = "block";
    CreateScrollbar(dojo.byId("divItemsContainer"), dojo.byId("divItemsContent"));
}


//function to select all items from shopping cart
function SelectAll(chkSelectAll) {
    var itemsSelected = 0;
    var totalPrice = 0;
    dojo.query("[state]", dojo.byId('divItemsContent')).forEach(function (node, index, arr) {
        var rType = node.getAttribute('reportType');
        if (chkSelectAll.getAttribute("state") == "check") {
            node.src = "images/unchecked.png";
            node.setAttribute("state", "uncheck");
            dojo.byId("imgPaypal").src = "images/disabledPayPal.gif";
            dojo.byId("imgPaypal").style.cursor = "default";
        }
        else {
            node.src = "images/checked.png";
            node.setAttribute("state", "check");
            dojo.byId("imgPaypal").src = "images/payPal.png";
            dojo.byId("imgPaypal").style.cursor = "pointer";
            itemsSelected++;
            totalPrice += (rType == 'PropertyReport') ? propertyReportPrice : propertyMapPrice;
        }
    });
    dojo.byId("tdItems").innerHTML = itemsSelected;
    dojo.byId("tdTPrice").innerHTML = currency + " " + totalPrice;
    if (chkSelectAll.getAttribute("state") == "check") {
        chkSelectAll.src = "images/unchecked.png";
        chkSelectAll.setAttribute("state", "uncheck");
    }
    else {
        chkSelectAll.src = "images/checked.png";
        chkSelectAll.setAttribute("state", "check");
    }
}

//Create checkbox for shopping cart
function CreateShoppingCheckBox(parcelId, reportType, isChecked) {
    var cb = document.createElement("img");
    cb.id = "chk" + parcelId;
    cb.style.width = "15px";
    cb.style.height = "15px";
    if (isChecked) {
        cb.src = "images/checked.png";
        cb.setAttribute("state", "check");
        dojo.byId("imgPaypal").style.cursor = "pointer";
        dojo.byId("imgPaypal").src = "images/payPal.png";
    }
    else {
        cb.src = "images/unchecked.png";
        cb.setAttribute("state", "uncheck");
    }
    cb.setAttribute("parcelId", parcelId);
    cb.setAttribute("reportType", reportType);
    return cb;
}

//Cancel shopping cart
function CancelShopping() {
    dojo.byId("divAddressSearch").style.display = "block";
    dojo.byId("divShoppingCart").style.display = "none";
    dojo.byId("txtValidationCode").value = "";
}

//Reset feedback values
function ResetFeedBackValues() {
    map.getLayer(tempLayerId).clear();
    dojo.byId("btnDrawFeedback").innerHTML = "Draw";
}

//Show search panel
function ShowSearchPanel() {
    dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divShareContainer').style.height = '0px';
    dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divLayerContainer').style.height = '0px';
    if (isMobileDevice) {
        SetHeightAddressResults();
        dojo.byId('divAddressContainer').style.display = "block";
        dojo.replaceClass("divAddressContainer", "opacityShowAnimation", "opacityHideAnimation");
        dojo.replaceClass("divAddressContent", "showContainer", "hideContainer");
    }
    else {
        SetHeightAddressResults();
        ResetData();
        dojo.byId("divAddressSearch").style.display = "block";
        dojo.byId("divFeedback").style.display = "none";
        dojo.byId("divShoppingCart").style.display = "none";
        dojo.byId("divCreatePropertyReport").style.display = "none";
    }
}

//Hide address container
function HideAddressContainer() {
    if (isMobileDevice) {
        RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
        dojo.replaceClass("divAddressContainer", "opacityHideAnimation", "opacityShowAnimation");
        dojo.replaceClass("divAddressContent", "hideContainer", "showContainer");
    }
}

//Hide info window container
function HideInfoWindowDataContainer() {
    dojo.replaceClass("divInfoWindowContainer", "opacityHideAnimation", "opacityShowAnimation");
    dojo.replaceClass("divInfoWindowContent", "hideContainer", "showContainer");
}

//Create checkbox for basemap container
function CreateCheckBox(layerId, chkBoxValue, isChecked) {
    var cb = document.createElement("img");
    cb.id = "chk" + layerId;
    if (isMobileDevice) {
        cb.style.width = "44px";
        cb.style.height = "44px";
    }
    else {
        cb.style.width = "20px";
        cb.style.height = "20px";
    }
    if (isChecked) {
        cb.src = "images/checked.png";
        cb.setAttribute("state", "check");
    }
    else {
        cb.src = "images/unchecked.png";
        cb.setAttribute("state", "uncheck");
    }
    cb.setAttribute("value", chkBoxValue);
    cb.setAttribute("layerId", layerId);
    return cb;
}

//Create dynamic layer and adding those values to a div container
function CreateDynamicServiceLayer(layerURL, layerIndex, layerId, isVisible, displayName) {
    var imageParams = new esri.layers.ImageParameters();
    var lastindex = layerURL.lastIndexOf('/');
    imageParams.layerIds = [layerIndex];
    imageParams.layerOption = esri.layers.ImageParameters.LAYER_OPTION_SHOW;
    var dynamicLayer = layerURL.substring(0, lastindex);
    var dynamicMapService = new esri.layers.ArcGISDynamicMapServiceLayer(dynamicLayer, {
        id: layerId,
        imageParameters: imageParams,
        visible: isVisible
    });

    dojo.io.script.get({
        url: layerURL + '?f=json',
        preventCache: true,
        callbackParamName: "callback",
        timeout: 10000,
        load: function (data) {
            layersCounter++;
            if (layersCounter == layers.length) {
                HideProgressIndicator();
            }
            var table = document.createElement("table");
            var tbody = document.createElement("tbody");
            table.appendChild(tbody);
            var tr = document.createElement("tr");
            tbody.appendChild(tr);

            var td = document.createElement("td");

            var checkbox = CreateCheckBox(layerId, layerIndex, isVisible);

            checkbox.onclick = function () {
                if (this.getAttribute("state") == "check") {
                    this.src = "images/unchecked.png";
                    this.setAttribute("state", "uncheck");
                    dynamicMapService.hide();
                    map.infoWindow.hide();
                }
                else {
                    this.src = "images/checked.png";
                    this.setAttribute("state", "check");
                    ShowProgressIndicator();
                    dynamicMapService.show();
                    map.infoWindow.hide();
                    selectedGraphic = null;
                    map.getLayer(tempLayerId).clear();
                    map.getLayer(tempParcelLayerId).clear();
                }
                HideProgressIndicator();
            };

            td.appendChild(checkbox);
            tr.appendChild(td);

            td = document.createElement("td");
            var img = document.createElement("img");
            img.src = layerURL + '/images/' + data.drawingInfo.renderer.symbol.url;
            if (isMobileDevice) {
                img.style.width = "44px";
                img.style.height = "44px";
            }
            else {
                img.style.width = "20px";
                img.style.height = "20px";
            }
            td.appendChild(img);

            tr.appendChild(td);

            td = document.createElement("td");
            td.appendChild(document.createTextNode(displayName));

            tr.appendChild(td);

            dojo.byId('divLayers').appendChild(table);
        },
        error: function (error) {
            layersCounter++;
            if (layersCounter == layers.length) {
                HideProgressIndicator();
            }
        }
    });
    return dynamicMapService;
}

//Get layer info based on key
function GetLayerInfo(key) {
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].Key == key)
            return i;
    }
}

//Set height for parcel data container
function SetHeightFeatureData() {
    var height = (isMobileDevice) ? dojo.window.getBox().h : dojo.coords(dojo.byId('divFeatureDataScrollbarContent')).h;

    if (isBrowser) {
        dojo.byId('divFeatureDataScrollbarContainer').style.height = (height - 2) + "px";
    }
    if (isMobileDevice) {
        dojo.byId('divFeatureDataScrollbarContainer').style.height = (height - 75) + "px";
    }
    setTimeout(function () {
        CreateScrollbar(dojo.byId("divFeatureDataScrollbarContainer"), dojo.byId("divFeatureDataScrollbarContent"));
    }, 500)

}

//Get MaxOffSet
function MaxOffSet() {
    return Math.floor(map.extent.getWidth() / map.width);
}

//Get extent from point to query the layer
function ExtentFromPoint(point) {
    var tolerance = (MaxOffSet() < 10) ? 10 : MaxOffSet();
    if (isMobileDevice) {
        tolerance = (MaxOffSet() < 15) ? 15 : MaxOffSet();
    }
    var screenPoint = map.toScreen(point);
    var pnt1 = new esri.geometry.Point(screenPoint.x - tolerance, screenPoint.y + tolerance);
    var pnt2 = new esri.geometry.Point(screenPoint.x + tolerance, screenPoint.y - tolerance);
    var mapPoint1 = map.toMap(pnt1);
    var mapPoint2 = map.toMap(pnt2);
    return new esri.geometry.Extent(mapPoint1.x, mapPoint1.y, mapPoint2.x, mapPoint2.y, map.spatialReference);
}

var layerCount = 0;
var responseCount = 0;

//Populate sales/foreclosure data
function ShowFeatureInfoWindow(mapPoint) {
    layerCount = 0;
    responseCount = 0;
    map.infoWindow.hide();
    selectedGraphic = null;
    map.getLayer(tempLayerId).clear();
    map.getLayer(tempParcelLayerId).clear();
    RemoveScrollBar(dojo.byId("divParcelDataScrollContainer"));
    dojo.byId("divFeatureDataScrollbarContainer").style.display = "block";
    RemoveChildren(dojo.byId('divFeatureDataScrollbarContent'));
    taxLayerCount = 0;
    dojo.query('img[state = "check"]', dojo.byId('divLayers')).forEach(function (node, index, arr) {
        layerCount++;
        QueryLayer(node, mapPoint);
    });
}

//Query data for sales/foreclosure layers
function QueryLayer(node, mapPoint) {
    var layerInfo = layers[GetLayerInfo(node.getAttribute("layerId"))];
    var queryTask = new esri.tasks.QueryTask(layerInfo.ServiceURL);
    var query = new esri.tasks.Query();
    query.outSpatialReference = map.spatialReference;
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.geometry = ExtentFromPoint(mapPoint);
    query.maxAllowableOffset = MaxOffSet();
    query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
    queryTask.execute(query, function (results) {
        responseCount++
        if (results.features.length == 0) {
            if (layerCount == responseCount) {
                LocateParcelonMap(null, mapPoint);
            }
            return;
        }
        taxLayerCount++;

        if (taxLayerCount == dojo.query('img[state = "check"]', dojo.byId('divLayers')).length) {
            for (var ord = 0; ord < layers.length; ord++) {
                if (!layers[ord].ParcelQuery) {
                    var visibleLayer = layers[ord].Title;
                }
            }
            if (layerInfo.Title != visibleLayer) {
                return;
            }
        }

        responseCount = 0;
        selectedGraphic = results.features[0].geometry;
        RemoveChildren(dojo.byId('divFeatureDataScrollbarContent'));
        var table = document.createElement("table");
        table.style.width = "95%";
        table.style.height = "100%";
        table.style.textAlign = "left";
        dojo.byId("divFeatureDataScrollbarContent").appendChild(table);
        var tbody = document.createElement("tbody");
        table.appendChild(tbody);
        var resultSet = results.features[0];

        for (var attr in resultSet.attributes) {
            if (!resultSet.attributes[attr]) {
                resultSet.attributes[attr] = "";
            }
        }

        for (var index in layerInfo.Fields) {
            var tr = document.createElement("tr");
            tbody.appendChild(tr);
            var td = document.createElement("td");
            td.innerHTML = layerInfo.Fields[index].DisplayText;
            var td1 = document.createElement("td");
            td1.className = "tdWordBreak";
            var value = dojo.string.substitute(layerInfo.Fields[index].FieldName, resultSet.attributes);
            if (layerInfo.Fields[index].isDate) {
                var date = new js.date();
                var utcMilliseconds = Number(dojo.string.substitute(layerInfo.Fields[index].FieldName, resultSet.attributes));
                td1.innerHTML = dojo.date.locale.format(date.utcTimestampFromMs(utcMilliseconds), { datePattern: datePattern, selector: "date" });
            }
            else if (layerInfo.Fields[index].DataType == "double") {
                var formattedValue = dojo.number.format(value, { pattern: "#,##0.##" });
                td1.innerHTML = currency + " " + formattedValue;
            }
            else {
                td1.innerHTML = dojo.string.substitute(layerInfo.Fields[index].FieldName, resultSet.attributes);
            }
            tr.appendChild(td);
            tr.appendChild(td1);
        }
        var screenPoint;
        dojo.byId('tdFeatureHeading').innerHTML = layerInfo.Title;
        (isMobileDevice) ? map.setExtent(GetMobileMapExtent(selectedGraphic)) : map.setExtent(GetBrowserMapExtent(mapPoint));
        setTimeout(function () {
            if (isMobileDevice) {
                map.infoWindow.setTitle("");
                map.infoWindow.setContent("");
                setTimeout(function () {
                    var screenPoint;
                    screenPoint = map.toScreen(selectedGraphic);
                    screenPoint.y = map.height - screenPoint.y;
                    map.infoWindow.resize(225, 65);
                    map.infoWindow.show(screenPoint);
                    map.infoWindow.setTitle(dojo.string.substitute(infoWindowHeader, resultSet.attributes).trimString(20));
                    map.infoWindow.setContent(dojo.string.substitute(infoWindowContent, resultSet.attributes));
                    dojo.connect(map.infoWindow.imgDetailsInstance(), "onclick", function () {
                        dojo.byId('divFeatureInformation').style.display = "block";
                        dojo.replaceClass("divFeatureInformation", "opacityShowAnimation", "opacityHideAnimation");
                        dojo.addClass("divFeatureInformation", "divFeatureInformation");
                        dojo.replaceClass("divFeatureInfoWindow", "showContainer", "hideContainer");
                        dojo.addClass("divFeatureInfoWindow", "divFeatureInfoWindow");
                        SetHeightFeatureData();
                    });
                });
            }
            else {
                map.infoWindow.resize(330, 270);
                screenPoint = map.toScreen(mapPoint);
                screenPoint.y = map.height - screenPoint.y;
                map.infoWindow.show(screenPoint);
                map.infoWindow.setTitle("");
                map.infoWindow.reSetLocation(screenPoint);
                dojo.byId('divFeatureInfoWindow').style.display = "block";

            }
            SetHeightFeatureData();
        }, 100);
    }, function (err) {
    });
}

//Hide parcel information
function HideParcelInformationContainer() {
    if (isMobileDevice) {
        dojo.replaceClass("divParcelInformation", "opacityHideAnimation", "opacityShowAnimation");
        dojo.replaceClass("divParcelInfoWindow", "hideContainer", "showContainer");
    }
    else {
        map.infoWindow.hide();
        selectedGraphic = null;
    }
}

//Hide feature information
function HideFeatureInformationContainer() {
    if (isMobileDevice) {
        dojo.replaceClass("divFeatureInformation", "opacityHideAnimation", "opacityShowAnimation");
        dojo.replaceClass("divFeatureInfoWindow", "hideContainer", "showContainer");
    }
    else {
        map.infoWindow.hide();
        selectedGraphic = null;
        dojo.byId('divFeatureInfoWindow').style.display = "none";
    }
}

//Create property report
function CreatePropertyReport() {
    dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divShareContainer').style.height = '0px';
    dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divLayerContainer').style.height = '0px';
    if (map.getLayer(tempParcelLayerId).graphics.length == 0) {
        alert(messages.getElementsByTagName("selectParcel")[0].childNodes[0].nodeValue);
        return;
    }
    else {
        var feature = map.getLayer(tempParcelLayerId).graphics;
        var parcelId = selectedParcel;
        dojo.byId("tdParcelId").innerHTML = parcelId;
        dojo.byId("tdTaxParcelId").innerHTML = parcelId;
    }
    ResetData();
    dojo.byId("divFeedback").style.display = "none";
    dojo.byId("divAddressSearch").style.display = "none";
    dojo.byId("divShoppingCart").style.display = "none";
    dojo.byId("divCreatePropertyReport").style.display = "block";
    if (propertyReportPrice == 0) {
        dojo.byId("tdPropertyReport").innerHTML = "Download";
    }
    if (propertyMapPrice == 0) {
        dojo.byId("tdPropertyMap").innerHTML = "Download";
    }
}

//Show the neighborhood view
function ShowNeighborhood() {
    RemoveScrollBar(dojo.byId("divParcelDataScrollContainer"));
    dojo.byId("divParcelDataScrollContainer").style.display = "none";
    dojo.byId("divNeighborhoodContainer").style.display = "block";
    dojo.byId("divBroadbandContainer").style.display = "none";
    CreateScrollbar(dojo.byId("divNeighborhoodContainer"), dojo.byId("divNeighborhoodContent"));
}

//Show the broadband view
function ShowBroadband() {
    RemoveScrollBar(dojo.byId("divParcelDataScrollContainer"));
    dojo.byId("divParcelDataScrollContainer").style.display = "none";
    dojo.byId("divNeighborhoodContainer").style.display = "none";
    dojo.byId("divBroadbandContainer").style.display = "block";
    setTimeout(function () {
        CreateScrollbar(dojo.byId("divBroadbandContainer"), dojo.byId("divBroadbandContent"));
    }, 500);
}

//Show the property view
function ShowProperty() {
    RemoveScrollBar(dojo.byId('divFeatureDataScrollbarContainer'));
    RemoveScrollBar(dojo.byId("divParcelDataScrollContainer"));
    ResetData();
    dojo.byId("divParcelDataScrollContainer").style.display = "block";
    dojo.byId("divNeighborhoodContainer").style.display = "none";
    dojo.byId("divBroadbandContainer").style.display = "none";
    CreateScrollbar(dojo.byId("divParcelDataScrollContainer"), dojo.byId("divParcelScrollContent"));
}

//Show the property view on start
function ShowPropertyOnStart() {
    RemoveScrollBar(dojo.byId("divParcelDataScrollContainer"));
    ResetData();
    dojo.byId("divParcelDataScrollContainer").style.display = "block";
    dojo.byId("divNeighborhoodContainer").style.display = "none";
    dojo.byId("divBroadbandContainer").style.display = "none";
}

//Populate broadband information
function PopulateBroadBandInformation(broadBandService, location, parcelId, reportType, PDF) {
    RemoveChildren(dojo.byId('divBroadbandContent'));
    var url = dojo.string.substitute(broadBandService.ServiceURL, location);
    dojo.io.script.get({
        url: url,
        callbackParamName: "callback",
        timeout: 5000,
        load: function (data) {
            var results = data.Results[broadBandService.Key];
            if (parcelId) {
                pdfData[parcelId][reportType]["BroadbandInfo"][broadBandService.Key] = {}
                if (results.length > 0) {
                    var resultArray = [];
                    for (var i = 0; i < results.length; i++) {
                        resultArray.push(results[i].holdingCompanyName + "$" + downloadSpeed[results[i].technologies[0].maximumAdvertisedDownloadSpeed]);
                    }
                    pdfData[parcelId][reportType]["BroadbandInfo"][broadBandService.Key] = resultArray.join("#");
                }
                ExecuteParcelGPService(parcelId, reportType);
            }
            var hasChildren = dojo.byId("divBroadbandContent").hasChildNodes();
            if (!PDF) {
                HideProgressIndicator();
            }
            if (!results) {
                return;
            }
            var table = document.createElement("table");
            table.style.width = "95%";
            table.style.textAlign = "left";
            dojo.byId("divBroadbandContent").appendChild(table);
            if (!hasChildren) {
                var br = document.createElement("br");
                dojo.byId("divBroadbandContent").appendChild(br);
            }

            var tbody = document.createElement("tbody");
            table.appendChild(tbody);
            var tr = document.createElement("tr");
            tbody.appendChild(tr);
            var td = document.createElement("td");

            td.innerHTML = broadBandService.Title;

            td.style.fontWeight = "bold";
            td.style.width = "100%";
            td.colSpan = "2"
            tr.appendChild(td);
            for (var i = 0; i < results.length; i++) {
                var trData = document.createElement("tr");
                tbody.appendChild(trData);
                var tdHolder = document.createElement("td");
                tdHolder.style.width = "70%";
                tdHolder.innerHTML = results[i].holdingCompanyName;
                trData.appendChild(tdHolder);
                var tdSpeed = document.createElement("td");
                tdSpeed.innerHTML = downloadSpeed[results[i].technologies[0].maximumAdvertisedDownloadSpeed];
                trData.appendChild(tdSpeed);
            }
            SetHeightParcelData();
        },
        error: function(error){
            HideProgressIndicator();
        }
    });
}

var recordCounter = 0;
var noofRecords = 0;


//get params to call GP service
function ExecuteParcelGPService(parcelId, reportType) {
    if (pdfData[parcelId][reportType]["NeighbourhoodInfo"] == "")
        return;

    var hasBroadbandInformation = 0;
    var count = 0;
    for (var i in broadBandService) {
        count++;
        (pdfData[parcelId][reportType]["BroadbandInfo"][broadBandService[i].Key]) ? hasBroadbandInformation++ : hasBroadbandInformation;
    }
    if (hasBroadbandInformation != count) {
        return;
    }

    if (reportType == "PropertyReport" && propertyReportPrice != 0) {
        alert(messages.getElementsByTagName("propertyReportAdded")[0].childNodes[0].nodeValue);
        dojo.byId('txtSelectedLayout').value = "";
        dojo.byId('txtMapTitle').value = "";
        HideProgressIndicator();
        return;
    }
    if (reportType == "PropertyMap" && propertyMapPrice != 0) {
        alert(messages.getElementsByTagName("propertyMapAdded")[0].childNodes[0].nodeValue);
        dojo.byId('txtSelectedLayout').value = "";
        dojo.byId('txtMapTitle').value = "";
        HideProgressIndicator();
        return;
    }

    noofRecords = 1;
    recordCounter = 0;
    CallParcelGPService(parcelId, reportType);
}

//Post data to GP service
function CallParcelGPService(parcelId, reportType) {
    ShowProgressIndicator();
    var broadbandInfo = [];
    for (var i in broadBandService) {
        broadbandInfo.push(pdfData[parcelId][reportType]["BroadbandInfo"][broadBandService[i].Key]);
    }
    var mapExtent = pdfData[parcelId][reportType]["mapExtent"];
    var reportData = pdfData[parcelId][reportType]["AttributeInfo"] + "~" + pdfData[parcelId][reportType]["NeighbourhoodInfo"] + "~" + broadbandInfo.join("#");

    for (var i = 0; i < layers.length; i++) {
        if (layers[i].ParcelQuery) {
            var taxServiceURL = layers[i].ServiceURL;
            var taxServiceOpacity = layers[i].Alpha;
            var taxServiceColor = new dojo.Color(layers[i].Color);
            var taxParcelColor = [];
            taxParcelColor.push(taxServiceColor.r);
            taxParcelColor.push(taxServiceColor.g);
            taxParcelColor.push(taxServiceColor.b);
            taxParcelColor.push(taxServiceColor.a);
            break;
        }
    }

    for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
        if (map.getLayer(baseMapLayers[bMap].Key).visible) {
            var basemapURL = baseMapLayers[bMap].MapURL;
        }
    }

    if (reportType == 'PropertyMap') {
        var webmap = {
            "mapOptions": {
                "extent": {
                    "xmin": parseFloat(mapExtent.xmin),
                    "ymin": parseFloat(mapExtent.ymin),
                    "xmax": parseFloat(mapExtent.xmax),
                    "ymax": parseFloat(mapExtent.ymax),
                    "spatialReference": {
                        "wkid": 102100
                    }
                },
                "scale": pdfData[parcelId][reportType]["scale"],
                "spatialReference": {
                    "wkid": 102100
                }
            },
            "operationalLayers": [
            {
                "url": taxServiceURL,
                "title": "Watershed",
                "opacity": taxServiceOpacity,
                "layerDefinition": {
                    "drawingInfo": {
                        "renderer": {
                            "type": "simple",
                            "symbol": {
                                "type": "esriSFS",
                                "style": "esriSFSSolid",
                                "color": taxParcelColor,
                                "outline": {
                                    "type": "esriSLS",
                                    "style": "esriSLSSolid",
                                    "color": taxParcelColor,
                                    "width": 2.5
                                }
                            },
                            "label": "",
                            "description": ""
                        },
                        "transparency": 0,
                        "labelingInfo": null
                    },
                    "objectIds": [
                         pdfData[parcelId][reportType]["objId"]
                    ]
                }
            }
        ],
            "baseMap": {
                "title": "Shared Imagery Basemap",
                "baseMapLayers": [
                {
                    "url": basemapURL
                }
            ]
            },
            "exportOptions": {
                "dpi": 300,
                "outputSize": [
                500,
                500
            ]
            },
            "layoutOptions": {
                "titleText": " ",
                "scaleBarOptions": {
                    "metricUnit": "kilometers",
                    "metricLabel": "km",
                    "nonMetricUnit": "miles",
                    "nonMetricLabel": "mi"
                }
            }
        };

        //For Map Title//
        if (!pdfData[parcelId][reportType]["mapTitle"]) {
            webmap.layoutOptions.titleText = "TaxParcel Report";
        }
        else {
            webmap.layoutOptions.titleText = pdfData[parcelId][reportType]["mapTitle"];
        }

        var params = {};
        params["f"] = "json";
        params["Web_Map_as_JSON"] = dojo.toJson(webmap);
        params["Format"] = "PDF";
        if (pdfData[parcelId][reportType]["layout"] == "Landscape8x11") {
            params["Layout_Template"] = "A4 Landscape";
        }
        else {
            params["Layout_Template"] = "A4 Portrait";
        }

        esri.request({
            url: printTaskURL,
            content: params,
            callbackParamName: "callback",
            load: function (data) {
                HideProgressIndicator();
                window.open(data.results[0].value.url);
            },
            error: function (err) {
                HideProgressIndicator();
                alert(err.message);
            }
        }, { useProxy: true });
    }
    else if (reportType == 'PropertyReport') {
        var featureSet = new esri.tasks.FeatureSet();
        var graphic = pdfData[parcelId][reportType]["Graphic"];
        graphic.setAttributes({ "ID": 1 });
        featureSet.features.push(graphic);

        var params = {
            "Layout": "Landscape8x11",
            "Map_Title": "Map Title",
            "ReportData": reportData
        };
        esri.config.defaults.io.alwaysUseProxy = true;

        params = {
            "Layout": "Landscape8x11",
            "ReportData": reportData
        };

        reportGPService.submitJob(params, function (jobInfo) {
            recordCounter++;
            if (jobInfo.jobStatus != "esriJobFailed") {
                reportGPService.getResultData(jobInfo.jobId, "PDF", function (outputFile) {
                    window.open(outputFile.value.url);
                });
                if (noofRecords == recordCounter) {
                    HideProgressIndicator();
                    dojo.byId("txtValidationCode").value = "";
                }
            }
        }, function (jobInfo) {
            var status = jobInfo.jobStatus;
            if (status == "esriJobFailed") {
                HideProgressIndicator();
                dojo.byId("txtValidationCode").value = "";
                alert(status);
            }
        }, function (err) {
            recordCounter++;
            if (noofRecords == recordCounter) {
                HideProgressIndicator();
                dojo.byId("txtValidationCode").value = "";
            }
            alert(err.message);
        });
        esri.config.defaults.io.alwaysUseProxy = false;
    }
}

//Convert JSON format to string
function JSONstringify(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
    }
    else {
        // array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n];
            t = typeof (v);
            if (t == "string") v = '"' + v + '"';
            else if (t == "object" && v !== null) v = JSONstringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
}


//Disconnects click query and activates tool for drawing feedback
function startDrawingFeedback(btnDrawFeedback) {
    draw = true;
    tb.activate(drawTool);
    if (btnDrawFeedback.innerHTML != "Draw") {
        ResetFeedBackValues();
    }
    dojo.byId("trDraw").style.display = "block";
    dojo.byId("trDrawFeedback").style.display = "none";
}

//Handles end of drawing feedback
function finishDrawingFeedback(geometry) {
    draw = false;
    tb.deactivate();
    feedbackItem = new esri.Graphic(geometry, polygonFillSymbol, null, null);
    map.getLayer(tempLayerId).add(feedbackItem);
    dojo.byId("trDraw").style.display = "none";
    dojo.byId("trDrawFeedback").style.display = "block";
    dojo.byId("btnDrawFeedback").innerHTML = "Redraw";
}

//Show toggle request types
function ToggleRequestTypesList() {
    dojo.byId('divSelectedRequest').style.display = (dojo.byId('divSelectedRequest').style.display == "block") ? "none" : "block";
    CreateScrollbar(dojo.byId('divScrollBarContainer'), dojo.byId('divScrollBarContent'));
}

//Displaying the PDF data
function CreatePdfParcelId(parcelID) {
    dojo.byId("tdParcelId").innerHTML = parcelID;
    dojo.byId("tdTaxParcelId").innerHTML = parcelID;
}

//Show toggle layout types
function ToggleSelectedLayoutList() {
    dojo.byId('divSelectedLayout').style.display = (dojo.byId('divSelectedLayout').style.display == "block") ? "none" : "block";
    CreateScrollbar(dojo.byId('divLayoutconatiner'), dojo.byId('divlayoutContent'));
}

//Create pdf report for map/parcel
function CreatePDF(reportType) {
    var feature = map.getLayer(tempParcelLayerId).graphics;

    if (feature.length == 0) {
        alert(messages.getElementsByTagName("selectParcel")[0].childNodes[0].nodeValue);
        return;
    }
    feature = selectedFeature;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].ParcelQuery) {
            ShowProgressIndicator();

            if (reportType == "PropertyMap") {
                if (dojo.byId('txtSelectedLayout').value.trim() == "") {
                    HideProgressIndicator();
                    alert(messages.getElementsByTagName("selectMapLayout")[0].childNodes[0].nodeValue);
                    return;
                }
                else if (dojo.byId('txtMapTitle').value.trim() == "") {
                    HideProgressIndicator();
                    alert(messages.getElementsByTagName("enterMapTitle")[0].childNodes[0].nodeValue);
                    return;
                }
            }

            var parcelId = selectedParcel;
            var reportDownloadFlag = false;
            if (reportType == "PropertyReport" && propertyReportPrice == 0) {
                reportDownloadFlag = true;
                ShowProgressIndicator();
            }
            if (reportType == "PropertyMap" && propertyMapPrice == 0) {
                reportDownloadFlag = true;
                ShowProgressIndicator();
            }

            if (!reportDownloadFlag && pdfData[parcelId] && pdfData[parcelId][reportType]) {
                HideProgressIndicator();
                alert(messages.getElementsByTagName("alreadyAddedParcelId")[0].childNodes[0].nodeValue);
                return;
            }
            else if (!pdfData[parcelId]) {
                pdfData[parcelId] = {};
            }
            pdfData[parcelId][reportType] = {};
            pdfData[parcelId][reportType]["ReportDescription"] = (reportType == 'PropertyReport') ? "Property Report - " + taxParcelId + " " + parcelId : "Property Map - " + taxParcelId + " " + parcelId;
            pdfData[parcelId][reportType]["mapTitle"] = dojo.byId('txtMapTitle').value;
            pdfData[parcelId][reportType]["AttributeInfo"] = "";
            pdfData[parcelId][reportType]["NeighbourhoodInfo"] = "";
            pdfData[parcelId][reportType]["BroadbandInfo"] = {};
            pdfData[parcelId][reportType]["mapExtent"] = GetPDFMapExtent(feature.geometry.getExtent().getCenter());
            pdfData[parcelId][reportType]["scale"] = map.__LOD.scale;
            pdfData[parcelId][reportType]["layout"] = dojo.byId('txtSelectedLayout').getAttribute("layout");


            var graphic = new esri.Graphic(feature.geometry, null, null, null);
            pdfData.isEmpty = false;
            pdfData[parcelId][reportType]["Graphic"] = graphic;

            for (var i = 0; i < layers.length; i++) {
                if (layers[i].ParcelQuery) {
                    pdfData[parcelId][reportType]["objId"] = feature.attributes[map.getLayer(layers[i].Key).objectIdField];
                    break;
                }
            }



            var parcelInfoWindowFields = layers[i].Fields;
            for (var index in feature.attributes) {
                if (!feature.attributes[index]) {
                    feature.attributes[index] = showNullValueAs;
                }
            }

            var attributeInfo = [];
            attributeInfo.push(dojo.string.substitute(infoWindowHeader, feature.attributes));
            for (var index in parcelInfoWindowFields) {
                if (parcelInfoWindowFields[index].DataType == "double") {
                    var formattedValue = currency + " " + dojo.number.format(dojo.string.substitute(parcelInfoWindowFields[index].FieldName, feature.attributes), { pattern: "#,##0.##" });
                    attributeInfo.push(formattedValue);
                }
                else {
                    attributeInfo.push(dojo.string.substitute(parcelInfoWindowFields[index].FieldName, feature.attributes));
                }
            }

            pdfData[parcelId][reportType]["AttributeInfo"] = attributeInfo.join("^");

            for (var i in neighbourHoodLayerInfo) {
                if (map.getLayer(neighbourHoodLayerInfo[i].id).maxScale <= mapScale && map.getLayer(neighbourHoodLayerInfo[i].id).minScale >= mapScale) {
                    PopulateNeighbourHoodInformation(neighbourHoodLayerInfo[i], feature.geometry.getExtent().getCenter(), dojo.string.substitute(parcelAttributeID, feature.attributes), reportType);
                }
            }

            geometryService.project([feature.geometry.getExtent().getCenter()], new esri.SpatialReference({ wkid: 4326 }), function (newPoint) {
                var point = newPoint[0];
                var location = { "latitude": point.y, "longitude": point.x };
                for (var i = 0; i < broadBandService.length; i++) {
                    PopulateBroadBandInformation(broadBandService[i], location, dojo.string.substitute(parcelAttributeID, feature.attributes), reportType, true);
                }
            });
        }
    }
}

//Cancel the creation of pdf
function CancelPdf() {
    dojo.byId("tdParcelId").innerHTML = "";
    dojo.byId("tdTaxParcelId").innerHTML = "";
    dojo.byId("txtSelectedLayout").value = "";
    dojo.byId("txtMapTitle").value = "";
    dojo.byId("divCreatePropertyReport").style.display = "none";
    dojo.byId("divAddressSearch").style.display = "block";
}

//Populate issue types
function PopulateFeedbackTypes(domainNames, controlId) {
    var table = document.createElement("table");
    table.style.width = "95%";
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);
    table.cellSpacing = 0;
    table.cellPadding = 0;
    for (var i = 0; i < domainNames.length; i++) {
        var tr = document.createElement("tr");
        tBody.appendChild(tr);
        var td = document.createElement("td");
        td.style.height = "25px";
        td.style.paddingLeft = "5px";
        td.align = "left";
        td.vAlign = "middle";
        td.style.color = "white";
        td.style.borderBottom = "1px solid white";
        td.style.cursor = "pointer";
        td.innerHTML = domainNames[i].name;
        td.onclick = function () {
            dojo.byId('txt' + controlId).value = this.innerHTML;
            dojo.byId('div' + controlId).style.display = "none";
        }
        tr.appendChild(td);
    }
    var scrollbar_container = document.createElement('div');
    scrollbar_container.id = "divScrollBarContainer";
    scrollbar_container.className = "scrollbar_container";

    var container = document.createElement("div");
    container.id = "divScrollBarContent";
    container.className = 'scrollbar_content';

    container.appendChild(table);

    scrollbar_container.appendChild(container);
    dojo.byId('div' + controlId).appendChild(scrollbar_container);
}

//Trim string
String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); }

//Submit feedback
function SubmitFeedback() {
    if (!ValidateData()) {
        return;
    }
    ShowProgressIndicator();

    var feedbackAttr = [];
    for (var key in feedbackAttributes) {
        if (feedbackAttributes[key].DefaultValue) {
            var date = new js.date();
            feedbackAttr[key] = date.utcMsFromTimestamp(date.localToUtc(date.localTimestampNow()));
        }
        else {
            if (feedbackAttributes[key].DomainNames) {
                feedbackAttr[key] = dojo.byId('txt' + feedbackAttributes[key].ControlId).value;
            }
            else {
                feedbackAttr[key] = dojo.byId(feedbackAttributes[key].ControlId).value;
            }
        }
    }

    var feedbackGraphic = new esri.Graphic(map.getLayer(tempLayerId).graphics[0].geometry, null, feedbackAttr, null);
    map.getLayer(feedbackLayer.Key).applyEdits([feedbackGraphic], null, null, function (addResults) {
        HideProgressIndicator();
        alert(messages.getElementsByTagName("submittedSuccessfully")[0].childNodes[0].nodeValue);
        ResetData();
        map.getLayer(feedbackLayer.Key).setDefinitionExpression("1=2");
    }, function (err) {
        HideProgressIndicator();
        alert(messages.getElementsByTagName("submitFailed")[0].childNodes[0].nodeValue);
        ResetData();
    });
}

//Cancel feedback
function CancelFeedBack() {
    ResetData();
    dojo.byId("divAddressSearch").style.display = "block";
    dojo.byId("divFeedback").style.display = "none";
}

//Reset data for feedback container
function ResetData() {
    ShowSpanErrorMessage("spanServiceErrorMessage", "");

    map.getLayer(tempLayerId).clear();
    dojo.byId("btnDrawFeedback").innerHTML = "Draw";
    dojo.byId("txtSelectedRequest").value = "";
    dojo.byId('txtComment').value = "";
    dojo.byId('txtName').value = "";
    dojo.byId('txtPhone').value = "";
    dojo.byId('txtMail').value = "";
    dojo.byId("trDraw").style.display = "none";
    dojo.byId("trDrawFeedback").style.display = "block";
    draw = false;
    tb.deactivate();
}

//Validating Email in comments tab
function CheckMailFormat(emailValue) {
    var pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailValue.length <= 149 && pattern.test(emailValue);
}

//Validate name
function IsName(name) {
    var namePattern = /^[A-Za-z\.\-\, ]{1,150}$/;
    if (namePattern.test(name)) {
        return true;
    } else {
        return false;
    }
}

//Validate number
function IsNumber(number) {
    var regexObj = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (regexObj.test(number)) {
        var formattedPhoneNumber = number.replace(regexObj, "($1) $2-$3");
        return true;
    } else {
        return false;
    }
}

//Validate data the submit details
function ValidateData() {
    dojo.byId("spanServiceErrorMessage").style.display = "none";
    if (dojo.byId("txtSelectedRequest").value.trim() == "") {
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("selectFeedbackType")[0].childNodes[0].nodeValue);

        return false;
    }
    if (map.getLayer(tempLayerId).graphics.length == 0) {
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("selectArea")[0].childNodes[0].nodeValue);
        return false;
    }

    if (dojo.byId('txtComment').value.trim() == "") {
        dojo.byId('txtComment').focus();
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterComments")[0].childNodes[0].nodeValue);
        return false;
    }
    if (dojo.byId('txtComment').value.trim().length > 0 && dojo.byId('txtComment').value.trim().length > 255) {
        dojo.byId('txtComment').focus();
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("commentsExceeds")[0].childNodes[0].nodeValue);
        return false;
    }

    if (dojo.byId('txtName').value.trim().length > 0 && !IsName(dojo.byId('txtName').value.trim())) {
        dojo.byId('txtName').focus();
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("nameProvisions")[0].childNodes[0].nodeValue);
        return false;
    }


    if (dojo.byId('txtPhone').value.trim().length > 0 && !IsNumber(dojo.byId('txtPhone').value.trim())) {
        dojo.byId('txtPhone').focus();
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterValidPhone")[0].childNodes[0].nodeValue);
        return false;
    }

    if (dojo.byId('txtMail').value.trim().length > 0 && !CheckMailFormat(dojo.byId('txtMail').value)) {
        dojo.byId('txtMail').focus();
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("enterValidMail")[0].childNodes[0].nodeValue);
        return false;
    }
    return true;
}

//Show error message span
function ShowSpanErrorMessage(controlId, message) {
    dojo.byId(controlId).style.display = "block";
    dojo.byId(controlId).innerHTML = message;
}

//Populate neighborhood data
function PopulateNeighbourHoodInformation(neighbourHoodLayerInfo, mapPoint, parcelId, reportType) {
    RemoveChildren(dojo.byId("divChartContent"));
    RemoveChildren(dojo.byId("divLegend"));
    dojo.byId("divChartContainer").style.display = "none";
    var query = new esri.tasks.Query();
    query.geometry = mapPoint;
    query.outFields = ["*"];
    map.getLayer(neighbourHoodLayerInfo.id).queryFeatures(query, function (featureSet) {
        if (parcelId) {
            var divTemp = document.createElement("div");
            divTemp.innerHTML = dojo.string.substitute(FixTokens(neighbourHoodLayerInfo.popupInfo.description), featureSet.features[0].attributes);
            pdfData[parcelId][reportType]["NeighbourhoodInfo"] = (document.all) ? divTemp.innerText + "^" + dojo.query("a", divTemp)[0].href : divTemp.textContent + "^" + dojo.query("a", divTemp)[0].href;
            ExecuteParcelGPService(parcelId, reportType);
            return;
        }
        dojo.byId("spanHeader").innerHTML = dojo.string.substitute(FixTokens(neighbourHoodLayerInfo.popupInfo.title), featureSet.features[0].attributes);
        var content = dojo.string.substitute(FixTokens(neighbourHoodLayerInfo.popupInfo.description), featureSet.features[0].attributes);
        var index = content.split("<a");
        var str = "<a target='_blank' "
        var newContent = index[0] + str + index[1];
        dojo.byId("spanContent").innerHTML = newContent;

        if (neighbourHoodLayerInfo.popupInfo.mediaInfos.length > 0) {
            dojo.byId("divChartContainer").style.display = "block";
            if (neighbourHoodLayerInfo.popupInfo.mediaInfos.type === "image") {
                ShowImage(neighbourHoodLayerInfo.popupInfo.mediaInfos.value);
            }
            else {
                var jsonValues = [];

                var mediaInfoData = {};
                for (var i in neighbourHoodLayerInfo.popupInfo.fieldInfos) {
                    mediaInfoData[neighbourHoodLayerInfo.popupInfo.fieldInfos[i].fieldName] = neighbourHoodLayerInfo.popupInfo.fieldInfos[i].label;
                }

                for (var i in neighbourHoodLayerInfo.popupInfo.mediaInfos[0].value.fields) {
                    var jsonItem = {};
                    var value = featureSet.features[0].attributes[neighbourHoodLayerInfo.popupInfo.mediaInfos[0].value.fields[i]];
                    if (value != 0) {
                        var r = Math.floor(Math.random() * 255);
                        var g = Math.floor(Math.random() * 255);
                        var b = Math.floor(Math.random() * 255);
                        var color = new dojo.Color([r, g, b, 1]);
                        jsonItem.y = value;
                        jsonItem.text = mediaInfoData[neighbourHoodLayerInfo.popupInfo.mediaInfos[0].value.fields[i]] + " " + value;
                        jsonItem.stroke = "black";
                        jsonItem.tooltip = value;
                        jsonItem.color = color.toHex();
                        jsonValues.push(jsonItem);
                    }
                }
                ShowChart(jsonValues);
                CreateLegend(jsonValues);
            }
        }
    });
}

//function to fix tokens. Appending $ to the string for dojo.string.replace
function FixTokens(value) {
    return value.replace(/(\{[^\{\r\n]+\})/g, "$$$1");
}

//Display image on chart
function ShowImage(value) {
    var img = document.createElement("img");
    img.src = value;
    dojo.byId("divChartContent").appendChild(img);
}

//Display image on pie chart
function ShowChart(type) {
    var pieChart = new dojox.charting.Chart2D(dojo.byId('divChartContent'));
    RemoveChildren(dojo.byId('divChartContent'));
    pieChart.surface = dojox.gfx.createSurface(dojo.byId('divChartContent'), 200, 200);
    pieChart.addPlot("default", {
        type: "Pie",
        radius: 75,
        labels: false
    });
    pieChart.addSeries("Series A", type);
    var anim_a = new dojox.charting.action2d.MoveSlice(pieChart, "default");
    var anim_b = new dojox.charting.action2d.Highlight(pieChart, "default");
    pieChart.render();
}

//Create legend for school enrollment
function CreateLegend(jsonObj) {
    var table = document.createElement("table");
    var tbChart = document.createElement("tbody");
    table.appendChild(tbChart);
    for (var i = 0; i < jsonObj.length; i++) {
        var trLegend = document.createElement("tr");
        var tdLegend1 = document.createElement("td");
        var tdLegend2 = document.createElement("td");
        tdLegend2.style.textAlign = "left";

        var divLegend = document.createElement("div");
        divLegend.style.background = jsonObj[i].color;
        divLegend.style.width = "11px";
        divLegend.style.height = "11px";

        tdLegend1.appendChild(divLegend);
        tdLegend2.appendChild(document.createTextNode((jsonObj[i].text)));

        trLegend.appendChild(tdLegend1);
        trLegend.appendChild(tdLegend2);

        tbChart.appendChild(trLegend);
    }
    dojo.byId("divLegend").appendChild(table);
}

//Show paypal page for purchase
function ShowPayPal() {
    if (dojo.byId("imgPaypal").src.indexOf("disabledPayPal.gif") > 0) {
        return;
    }
    var url = "paypal.aspx?Code=Purchase&Price=" + Number(dojo.byId("tdTPrice").innerHTML.split(" ")[1]) + "&Currency=" + paypalcurrency + "&AppName= " + dojo.byId('lblAppName').innerHTML + "&AppIcon=" + dojo.byId('imgApplication').src;
    if (!popupWin || popupWin.closed) {
        popupWin = window.open(url, "popupWin", "width=1000,height=700");
    } else popupWin.focus();
}

//Validate the request code
function ValidateRequest() {
    dojo.xhrGet({
        url: "validate.aspx?Code=Validate&ValidationCode=" + dojo.byId('txtValidationCode').value,
        handleAs: "text",
        preventCache: true,
        load: function (responseObject, ioArgs) {
            if (responseObject == "Valid") {
                ShowProgressIndicator();
                recordCounter = 0;
                dojo.query('img[state = "check"]', dojo.byId('divItemsContent')).forEach(function (node, index, array) {
                    noofRecords = array.length;
                    CallParcelGPService(node.getAttribute('parcelId'), node.getAttribute('reportType'));
                });
            }
            else {
                alert(messages.getElementsByTagName("invalidValidationCode")[0].childNodes[0].nodeValue);
            }
        }
    });
}

//Clear default value for text box controls
function ClearDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    target.style.color = "#FFF";
    target.value = '';
}

//Set default value on blur
function ReplaceDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    ResetTargetValue(target, "defaultAddressTitle", "gray");
}

//Set changed value for address
function ResetTargetValue(target, title, color) {
    if (target.value == '' && target.getAttribute(title)) {
        target.value = target.title;
        if (target.title == "") {
            target.value = target.getAttribute(title);
        }
    }
    target.style.color = color;
    lastSearchString = dojo.byId("txtAddress").value.trim();
}

//Restrict the maximum no of characters in the text area control
function ImposeMaxLength(Object, MaxLen) {
    return (Object.value.length <= MaxLen);
}