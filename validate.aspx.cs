/*
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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.SessionState;

public partial class validate : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (Request.QueryString["Code"].ToLower() == "Validate".ToLower())
        {
            Response.Clear();
            if (Request.QueryString["ValidationCode"].ToString() == Session.SessionID)
            {
                Response.Write("Valid");
                CreateNewSessionId();
            }
            else
            {
                Response.Write("Invalid");
            }
            Response.End();
            return;
        }
    }

    void CreateNewSessionId()
    {
        SessionIDManager Manager = new SessionIDManager();

        string NewID = Manager.CreateSessionID(Context);
        string OldID = Context.Session.SessionID;
        bool redirected = false;
        bool IsAdded = false;
        Manager.SaveSessionID(Context, NewID, out redirected, out IsAdded);
    }
}