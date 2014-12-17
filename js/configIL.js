/*global dojo */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true */
/*
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
dojo.provide("js.config");
dojo.declare("js.config", null, {

    // This file contains various configuration settings for "Tax Parcel Viewer" template
    //
    // Use this file to perform the following:
    //
    // 1.  Specify application title                  - [ Tag(s) to look for: ApplicationName ]
    // 2.  Set path for application icon              - [ Tag(s) to look for: ApplicationIcon ]
    // 3.  Set splash screen message                  - [ Tag(s) to look for: SplashScreenMessage ]
    // 4.  Set URL for help page                      - [ Tag(s) to look for: HelpURL ]
    //
    // 5.  Specify URL(s) for basemaps                - [ Tag(s) to look for: BaseMapLayers ]
    // 6.  Set initial map extent                     - [ Tag(s) to look for: DefaultExtent ]
    //
    // 8.  Specify WebMapId                           - [ Tag(s) to look for: WebMapId ]

    // 9.  Specify URL(s) for operational and overlay layers
    //                                                - [ Tag(s) to look for: FeedbackLayer ]
    // 10. Specify URL(s) for broadBandService        - [ Tag(s) to look for: BroadBandService ]
    // 11. Customize data formatting                  - [ Tag(s) to look for: ShowNullValueAs ]
    // 11a.Specify the image for geolocated point     - [ Tag(s) to look for: GeolocatedImage]
    //
    // 12. Customize address search settings          - [ Tag(s) to look for: LocatorDefaultAddress]
    //
    // 13. Set URL for geometry service               - [ Tag(s) to look for: GeometryService ]
    //
    // 14. Set URL for reportGPService                - [ Tag(s) to look for: ReportGPServiceURL]
    // 15. Set URL for PrintTaskService               - [ Tag(s) to look for: PrintTaskURL]
    // 16. Customize info-Window settings             - [ Tag(s) to look for: InfoWindowHeader, InfoWindowContent ]
    // 17. Customize info-Popup settings              - [ Tag(s) to look for: Layers ]
    // 18. Specify the attribute for parcel ID        - [ Tag(s) to look for: ParcelIdAttribute]
    // 19. Specify the date pattern                   - [ Tag(s) to look for: DatePattern]
    // 20. Configure data for the feedback            - [Tag(s) to look for: FeedbackAttributes]
    // 21. Specify the download speed for broadband   - [Tag(s) to look for: DownloadSpeed]
    // 22. Set the price for property report          - [Tag(s) to look for: PropertyReportPrice]
    // 23. Set the price for property map             - [Tag(s) to look for: PropertyMapPrice]
    // 24. Set the currency                           - [Tag(s) to look for: Currency]
    // 25. Set the color for selected address         - [Tag(s) to look for: SelectedAddressColor]
    // 26. Set data to be displayed for layouts for reports
    //                                                - [Tag(s) to look for: ReportLayouts]
    // 27. Specify URLs for map sharing               - [ Tag(s) to look for: FacebookShareURL, TwitterShareURL, ShareByMailLink ]
    // 28. In case of changing the TinyURL service
    // 28a. Specify URL for the new service           - [ Tag(s) to look for: MapSharingOptions (set TinyURLServiceURL, TinyURLResponseAttribute) ]
    //
    //

    // ------------------------------------------------------------------------------------------------------------------------
    // GENERAL SETTINGS
    // -----------------------------------------------------------------------------------------------------------------------
    // Set application title
    ApplicationName: "Tax Parcel Viewer",

    // Set application icon path
    ApplicationIcon: "images/logo.png",

    // Set splash window content - Message that appears when the application starts
    SplashScreenMessage: "<b>Tax Parcel Viewer</b> <br/> <hr/> <br/>The <b>Tax Parcel Viewer</b> provides the general public and other interested parties local government property tax and assessment information and supplements that information with lifestyle and internet broadband information for a given neighborhood.<br/><br/>To locate a parcel, simply click on the map or enter an address or parcel number in the search box and select a parcel from the list.<br/><br/>",

    // Set URL of help page/portal
    HelpURL: "help.htm",

    // ------------------------------------------------------------------------------------------------------------------------
    // BASEMAP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set baseMap layers
    // Please note: All basemaps need to use the same spatial reference. By default, on application start the first basemap will be loaded
    BaseMapLayers: [{
        Key: "parcelMap",
        ThumbnailSource: "images/Parcel map.png",
        Name: "Streets",
        MapURL: "http://tryitlive.arcgis.com/arcgis/rest/services/GeneralPurpose/MapServer",
        useForMobileDevice: true
    }, {
        Key: "imageryMap",
        ThumbnailSource: "images/imageryHybrid.png",
        Name: "Imagery",
        MapURL: "http://tryitlive.arcgis.com/arcgis/rest/services/ImageryHybrid/MapServer"
    }],

    // Initial map extent. Use comma (,) to separate values and don't delete the last comma
    DefaultExtent: "-9817210,5127895,-9814287,5127905",

    // ------------------------------------------------------------------------------------------------------------------------
    // OPERATIONAL DATA SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // specify WebMapID within quotes
    WebMapId: "f5c23594330d431aa5d9a27abb90296d",

    // Configure operational layers

    // Key is used as an layerId while adding this layer to the map and has to be unique
    // ServiceUrl is the REST end point for the PrecinctLayer

    FeedbackLayer: {
        Key: "feedbackLayer",
        ServiceUrl: "http://services.arcgis.com/b6gLrKHqgkQb393u/arcgis/rest/services/ParcelMarkupsIL/FeatureServer/0"

    },

    // Key is used as an layerId while adding this layer to the map and has to be unique
    // Title is used for the text to be displayed
    // ServiceUrl is the REST end point for the layer

    BroadBandService: [{
        Key: "wirelessServices",
        Title: "Wireless Broadband Providers for this Area",
        ServiceURL: "http://www.broadbandmap.gov/broadbandmap/broadband/jun2011/wireless?latitude=${latitude}&longitude=${longitude}&format=jsonp"
    }, {
        Key: "wirelineServices",
        Title: "Wireline Broadband Providers for this Area",
        ServiceURL: "http://www.broadbandmap.gov/broadbandmap/broadband/jun2011/wireline?latitude=${latitude}&longitude=${longitude}&format=jsonp"
    }],
    // ------------------------------------------------------------------------------------------------------------------------

    // Set string value to be shown for null or blank values
    ShowNullValueAs: "N/A",

    // ------------------------------------------------------------------------------------------------------------------------
    // ADDRESS SEARCH SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Set default address to search
    LocatorDefaultAddress: "1215 Hidden Springs",

    //Set the image for geolocated point
    GeolocatedImage: "images/RedPushPin.png",

    // ------------------------------------------------------------------------------------------------------------------------
    // GEOMETRY SERVICE SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set geometry service URL
    GeometryService: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",

    // ------------------------------------------------------------------------------------------------------------------------
    // GEOPROCESSING SERVICE SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set report geoprocessing service URL
    ReportGPServiceURL: "http://54.203.249.87:6080/arcgis/rest/services/TaxParcelReporting/GPServer/TaxParcelReporting",

    //Set URL for the print task
    PrintTaskURL: "http://54.203.249.87:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute",

    // ------------------------------------------------------------------------------------------------------------------------
    // INFO-WINDOW SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Info-window is a small, two line popup that gets displayed on selecting a feature
    // Set Info-window title. Configure this with text/fields
    InfoWindowHeader: "${SITEADDRESS}",
    InfoWindowContent: "${PARCELID}",

    // ------------------------------------------------------------------------------------------------------------------------
    // Specify the attribute for parcel ID
    ParcelIdAttribute: "${PARCELID}",

    // ------------------------------------------------------------------------------------------------------------------------

    // Specify the display text for parcel ID
    TaxParcelId: "Tax Parcel ID:",

    // ------------------------------------------------------------------------------------------------------------------------
    // Specify the format for date
    DatePattern: "MMM dd, yyyy",

    // ------------------------------------------------------------------------------------------------------------------------
    // Layer data is shown in the info window for parcel,sales and foreclosures.
    // Key is used as an layerId while adding this layer to the map and has to be unique
    // Title will set the layer name of the infowindow
    // ServiceUrl is the mapservice URL for the layer
    // isVisible is the boolean parameter to check if the layer is a currently visible or not
    // isDynamicMapService is the boolean parameter to check if the layer is a dynamic map service or not

    Layers: [{
        Key: "foreClosure",
        Title: "Foreclosures",
        ServiceURL: "http://tryitlive.arcgis.com/arcgis/rest/services/AssessmentOperationsIL/MapServer/0",
        isVisible: false,
        isDynamicMapService: false,
        Fields: [{
            DisplayText: "Parcel ID:",
            FieldName: "${PARCELID}",
            DataType: "string"
        }, {
            DisplayText: "Address:",
            FieldName: "${SITEADDRESS}",
            DataType: "string"
        }, {
            DisplayText: "Tax District Code:",
            FieldName: "${CVTTXCD}",
            DataType: "string"
        }, {
            DisplayText: "Date Recorded:",
            FieldName: "${RECORDDT}",
            DataType: "string",
            isDate: true
        }, {
            DisplayText: "Transaction Date:",
            FieldName: "${TRANSDT}",
            DataType: "string",
            isDate: true
        }, {
            DisplayText: "Liber:",
            FieldName: "${LIBER}",
            DataType: "string"
        }, {
            DisplayText: "Page:",
            FieldName: "${PAGE}",
            DataType: "string"
        }, {
            DisplayText: "Sale Amount:",
            FieldName: "${SALEAMNT}",
            DataType: "double"
        }]
    }, {
        Key: "parcelSale",
        Title: "Sales",
        ServiceURL: "http://tryitlive.arcgis.com/arcgis/rest/services/AssessmentOperationsIL/MapServer/1",
        isVisible: false,
        isDynamicMapService: false,
        Fields: [{
            DisplayText: "Parcel ID:",
            FieldName: "${PARCELID}",
            DataType: "string"
        }, {
            DisplayText: "Site Address:",
            FieldName: "${SITEADDRESS}",
            DataType: "string"
        }, {
            DisplayText: "Structure Type:",
            FieldName: "${RESSTRTYPE}",
            DataType: "string"
        }, {
            DisplayText: "Transaction Date:",
            FieldName: "${TRANSDT}",
            DataType: "string",
            isDate: true
        }, {
            DisplayText: "Grantor:",
            FieldName: "${GRANTOR}",
            DataType: "string"
        }, {
            DisplayText: "Grantee:",
            FieldName: "${GRANTEE}",
            DataType: "string"
        }, {
            DisplayText: "Liber:",
            FieldName: "${LIBER}",
            DataType: "string"
        }, {
            DisplayText: "Page:",
            FieldName: "${PAGE}",
            DataType: "string"
        }, {
            DisplayText: "Sale Amount:",
            FieldName: "${SALEAMNT}",
            DataType: "double"
        }]
    }, {
        Key: "taxParcelLayer",
        ServiceURL: "http://tryitlive.arcgis.com/arcgis/rest/services/TaxParcelQueryIL/MapServer/0",
        OutFields: "PARCELID, SITEADDRESS, CNVYNAME",
        ParcelQuery: "UPPER(PARCELID) LIKE '%${0}%' OR UPPER(SITEADDRESS) LIKE '%${0}%' OR UPPER(CNVYNAME) LIKE '%${0}%'",
        LocateParcelQuery: "PARCELID = '${0}'",
        DisplayFields: ["PARCELID", "SITEADDRESS"],
        UseColor: true,
        Color: "#00ff00",
        Alpha: 0.25,
        Fields: [{
            DisplayText: "Tax Parcel ID:",
            FieldName: "${PARCELID}",
            DataType: "string",
            isLink: true,
            href: "Photo.htm?ParcelId=${PARCELID}&SiteAddress=${SITEADDRESS}"
        }, {
            DisplayText: "Sub or Condo:",
            FieldName: "${CNVYNAME}",
            DataType: "string"
        }, {
            DisplayText: "Building : Unit:",
            FieldName: "${UNIT}",
            DataType: "string"
        }, {
            DisplayText: "Tax District:",
            FieldName: "${CVTTXDSCRP}",
            DataType: "string"
        }, {
            DisplayText: "School District:",
            FieldName: "${SCHLDSCRP}",
            DataType: "string"
        }, {
            DisplayText: "Use Description:",
            FieldName: "${USEDSCRP}",
            DataType: "string"
        }, {
            DisplayText: "Owner Name:",
            FieldName: "${OWNERNME1}",
            DataType: "string"
        }, {
            DisplayText: "Structure Type:",
            FieldName: "${RESSTRTYP}",
            DataType: "string"
        }, {
            DisplayText: "Floor Area:",
            FieldName: "${RESFLRAREA}",
            DataType: "string"
        }, {
            DisplayText: "Assessed Value:",
            FieldName: "${CNTASSDVAL}",
            DataType: "double"
        }, {
            DisplayText: "Taxable Value:",
            FieldName: "${CNTTXBLVAL}",
            DataType: "double"
        }, {
            DisplayText: "Current Taxes:",
            FieldName: "${TOTCNTTXOD}",
            DataType: "double"
        }]
    }],

    // ------------------------------------------------------------------------------------------------------------------------
    //Set the attributes for feedback layer
    FeedbackAttributes: {
        PROBTYPE: {
            DataType: "string",
            DefaultValue: false,
            ControlId: "SelectedRequest",
            DomainNames: true
        },
        COMMENT: {
            DataType: "string",
            DefaultValue: false,
            ControlId: "txtComment"
        },
        SUBMITDT: {
            DataType: "string",
            DefaultValue: true,
            ControlId: ""
        },
        NAME: {
            DataType: "string",
            DefaultValue: false,
            ControlId: "txtName"
        },
        PHONE: {
            DataType: "string",
            DefaultValue: false,
            ControlId: "txtPhone"
        },
        EMAIL: {
            DataType: "string",
            DefaultValue: false,
            ControlId: "txtMail"
        }
    },

    // ------------------------------------------------------------------------------------------------------------------------
    //Specify the download speed for broadband
    DownloadSpeed: {
        0: "N/A",
        1: "0-200kbps",
        2: "200kbps-768kbps",
        3: "768kbps-1.5mbps",
        4: "1.5-3mbps",
        5: "3-6mbps",
        6: "6-10mbps",
        7: "10-25mbps",
        8: "25-50mbps",
        9: "50-100mbps",
        10: "100mbps-1gbps",
        11: ">1gbps"
    },
    // ------------------------------------------------------------------------------------------------------------------------
    //Set the price for property report
    PropertyReportPrice: 0,

    // ------------------------------------------------------------------------------------------------------------------------
    //Set the price for property map
    PropertyMapPrice: 0,

    // ------------------------------------------------------------------------------------------------------------------------
    //Set the currency
    Currency: "$",

    PayPalCurrencyCode: "USD",

    // ------------------------------------------------------------------------------------------------------------------------
    //Set the color for selected address
    SelectedAddressColor: "#FF6600",

    // ------------------------------------------------------------------------------------------------------------------------
    //Set configuration item to allow users to turn the "Parcel Markups" off and on.
    ParcelMarkups: true,

    // ------------------------------------------------------------------------------------------------------------------------
    //SETTING FOR REPORT LAYOUTS
    // ------------------------------------------------------------------------------------------------------------------------
    //Set data to be displayed for layouts for reports
    ReportLayouts: [{
        DisplayText: "Landscape",
        Value: "Landscape8x11"
    }, {
        DisplayText: "Portrait",
        Value: "Portrait8x11"
    }],

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR MAP SHARING
    // ------------------------------------------------------------------------------------------------------------------------
    // Set URL for TinyURL service, and URLs for social media
    MapSharingOptions: {
        TinyURLServiceURL: "https://api-ssl.bitly.com/v3/shorten?longUrl=${0}",
        FacebookShareURL: "http://www.facebook.com/sharer.php?u=${0}&t=Tax%20Viewer%20Map",
        TwitterShareURL: "http://mobile.twitter.com/compose/tweet?status=Tax%20Viewer%20Map ${0}",
        ShareByMailLink: "mailto:%20?subject=Tax%20Viewer%20Map&body=${0}"
    }
});
