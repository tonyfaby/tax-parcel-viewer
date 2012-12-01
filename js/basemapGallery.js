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

function CreateBaseMapComponent() {
    if (!isMobileDevice) {
        for (var i = 0; i < baseMapLayers.length; i++) {
            map.addLayer(CreateBaseMapLayer(baseMapLayers[i].MapURL, baseMapLayers[i].Key, (i == 0) ? true : false));
        }

        var layerList = dojo.byId('layerList');

        for (var i = 0; i < Math.ceil(baseMapLayers.length / 2); i++) {
            var previewDataRow = document.createElement("tr");

            if (baseMapLayers[(i * 2) + 0]) {
                var layerInfo = baseMapLayers[(i * 2) + 0];
                layerList.appendChild(CreateBaseMapElement(layerInfo));
            }

            if (baseMapLayers[(i * 2) + 1]) {
                var layerInfo = baseMapLayers[(i * 2) + 1];
                layerList.appendChild(CreateBaseMapElement(layerInfo));
            }
        }
        var spanBreak = document.createElement("br");
        layerList.appendChild(spanBreak);
        dojo.addClass(dojo.byId("imgThumbNail" + baseMapLayers[0].Key), "selectedBaseMap");
    }
    else {
        for (var i = 0; i < baseMapLayers.length; i++) {
            if (baseMapLayers[i].useForMobileDevice) {
                map.addLayer(CreateBaseMapLayer(baseMapLayers[i].MapURL, baseMapLayers[i].Key, true));
            }
        }
    }
}

//function to create base map element
function CreateBaseMapElement(baseMapLayerInfo) {
    var divContainer = document.createElement("div");
    divContainer.className = "baseMapContainerNode";
    var imgThumbnail = document.createElement("img");
    imgThumbnail.src = baseMapLayerInfo.ThumbnailSource;
    imgThumbnail.className = "basemapThumbnail";
    imgThumbnail.id = "imgThumbNail" + baseMapLayerInfo.Key;
    imgThumbnail.setAttribute("layerId", baseMapLayerInfo.Key);
    imgThumbnail.onclick = function () {
        ChangeBaseMap(this);
        ShowBaseMaps();
    };
    var spanBaseMapText = document.createElement("span");
    var spanBreak = document.createElement("br");
    spanBaseMapText.className = "basemapLabel";
    spanBaseMapText.innerHTML = baseMapLayerInfo.Name;
    divContainer.appendChild(imgThumbnail);
    divContainer.appendChild(spanBreak);
    divContainer.appendChild(spanBaseMapText);

    return divContainer;
}


function ChangeBaseMap(spanControl) {
    HideMapLayers();
    var key = spanControl.getAttribute('layerId');

    for (var i = 0; i < baseMapLayers.length; i++) {
        dojo.removeClass(dojo.byId("imgThumbNail" + baseMapLayers[i].Key), "selectedBaseMap");
        if (baseMapLayers[i].Key == key) {
            currentBaseMap = key;
            dojo.addClass(dojo.byId("imgThumbNail" + baseMapLayers[i].Key), "selectedBaseMap");
            var layer = map.getLayer(baseMapLayers[i].Key);
            layer.show();
        }
    }
}

function CreateBaseMapLayer(layerURL, layerId, isVisible) {
    if (isVisible) {
        currentBaseMap = layerId;
    }
    var layer = new esri.layers.ArcGISTiledMapServiceLayer(layerURL, { id: layerId, visible: isVisible });
    return layer;
}

function HideMapLayers() {
    for (var i = 0; i < baseMapLayers.length; i++) {
        var layer = map.getLayer(baseMapLayers[i].Key);
        if (layer) {
            layer.hide();
        }
    }
}
