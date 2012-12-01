<%@ Page Language="C#" AutoEventWireup="true" CodeFile="paypal.aspx.cs" Inherits="_Default" %>
<!--
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
-->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <link href="styles/TaxParcel.css" rel="stylesheet" type="text/css" />
    <title>Pay Pal</title>
</head>
<body>
    <form id="form1" runat="server">
        <div id="divLogo" class="divLogo" style="display:block;">
        <table style="width: 100%; height: 100%;">
            <tr>
                <td style="width: 35px;">
                    <img runat="server" id="imgApp"  class="imgApplication"/>
                </td>
            </tr>
        </table>
    </div>
    <div class="divApplicationHeader" align="right">
        <table cellpadding="0" cellspacing="0" class="tableHeader">
            <tr>

                <td id="lblAppName" runat="server" align="left" style="color: White; padding-left: 100px;">
                </td>
            </tr>
        </table>
    </div>
    <div style="width: 100%; height: 100%; position: absolute; top: 80px; color: black">
        <table style="width: 100%;">
            <tr style="width: 100%;">
                <td align="center" colspan="2">
                   Please copy this code to download the property report/map. This code is valid for single use only.
                </td>
            </tr>
            <tr>
                <td align="right">
                    Validation Code: &nbsp;
                </td>
                <td align="left">
                    <asp:Label ID="lblValidationCode" runat="server"></asp:Label>
                </td>
            </tr>
        </table>
    </div>
    </form>
</body>
</html>
