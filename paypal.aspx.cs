/*
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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using com.paypal.sdk.services;
using com.paypal.sdk.profiles;
using com.paypal.sdk.util;
using GenerateCodeNVP;
using System.Web.SessionState;

public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            if (Request.QueryString["Code"].ToLower() == "Cancel".ToLower())
            {
                return;
            }
            else if (Request.QueryString["Code"].ToLower() == "Sucess".ToLower())
            {
                lblAppName.InnerHtml = Session["AppName"].ToString();
                imgApp.Src = Session["AppIcon"].ToString();
                lblValidationCode.Text = Session.SessionID;
                return;
            }
            else if (Request.QueryString["Code"].ToLower() == "Error".ToLower())
            {
                lblAppName.InnerHtml = Session["AppIcon"].ToString();
                imgApp.Src = Session["AppIcon"].ToString();
                lblValidationCode.Text = Session["errorresult"].ToString();
                return;
            }
            Session["AppName"] = Request.QueryString["AppName"].ToString();
            Session["AppIcon"] = Request.QueryString["AppIcon"].ToString();
            string url = Request.Url.Scheme + "://" + Request.Url.Host + ":" + Request.Url.Port + "";
            string cancelURL = url + ResolveUrl("paypal.aspx") + "?Code=Cancel";
            string returnURL = url + ResolveUrl("paypal.aspx") + "?Code=Sucess";
            ECSetExpressCheckout objset = new ECSetExpressCheckout();
            NVPCodec decoder = new NVPCodec();
            decoder = objset.ECSetExpressCheckoutCode(returnURL, Request.QueryString["AppName"].ToString(), System.Configuration.ConfigurationManager.AppSettings["AppCode"].ToString(), cancelURL, Request.QueryString["Price"].ToString(), "Sale", Request.QueryString["Currency"].ToString());
            string strAck = decoder["ACK"];
            if (strAck != null && (strAck == "Success" || strAck == "SuccessWithWarning"))
            {
                Session["TOKEN"] = decoder["TOKEN"];
                string host1 = "www." + ASPDotNetSamples.AspNet.Constants.ENVIRONMENT + ".paypal.com";
                //
                string ECURL = string.Empty;
                if (System.Configuration.ConfigurationManager.AppSettings["ENVIRONMENT"].ToString() == "T")
                {
                    ECURL = "https://" + host1 + "/cgi-bin/webscr?cmd=_express-checkout" + "&token=" + decoder["TOKEN"];
                }
                else
                {
                    ECURL = "https://www.paypal.com/webscr?cmd=_express-checkout" + "&token=" + decoder["TOKEN"];
                }
                Response.Redirect(ECURL, false);
            }
            else
            {
                Session["errorresult"] = decoder;
                string pStrResQue = "API=" + ASPDotNetSamples.AspNet.Util.BuildResponse(decoder, "Set", "");
                Response.Redirect("paypal.aspx?Code=Error");
            }
        }
        catch (Exception ex)
        {
            Session["errorresult"] = "API=" + ex.Message;
            Response.Redirect("paypal.aspx?Code=Error");
        }
    }
}