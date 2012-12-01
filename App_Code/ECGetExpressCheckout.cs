/*
 * Copyright 2005, 2008 PayPal, Inc. All Rights Reserved.
 *
 * GetExpressCheckoutDetails NVP example; last modified 08MAY23. 
 *
 * Get information about an Express Checkout transaction.  
 */
using System;
using com.paypal.sdk.services;
using com.paypal.sdk.profiles;
using com.paypal.sdk.util;
/**
 * PayPal .NET SDK sample code
 */
namespace GenerateCodeNVP
{
	public class ECGetExpressCheckout
	{
		public ECGetExpressCheckout()
		{
		}
        public NVPCodec ECGetExpressCheckoutCode(string token)
		{
			NVPCallerServices caller = new NVPCallerServices();
            IAPIProfile profile = ProfileFactory.createSignatureAPIProfile();
			/*
			 WARNING: Do not embed plaintext credentials in your application code.
			 Doing so is insecure and against best practices.
			 Your API credentials must be handled securely. Please consider
			 encrypting them for use in any production environment, and ensure
			 that only authorized individuals may view or modify them.
			 */

		// Set up your API credentials, PayPal end point, API operation and version.
            if (System.Configuration.ConfigurationManager.AppSettings["ENVIRONMENT"].ToString() == "T")
            {
                profile.APIUsername = "sdk-three_api1.sdk.com";
                profile.APIPassword = "QFZCWN5HZM8VBG7Q";
                profile.APISignature = "AVGidzoSQiGWu.lGj3z15HLczXaaAcK6imHawrjefqgclVwBe8imgCHZ";
                profile.Environment = "sandbox";
            }
            else if (System.Configuration.ConfigurationManager.AppSettings["ENVIRONMENT"].ToString() == "L")
            {
                profile.APIUsername = "murty.korada_api1.cybertech.com";
                profile.APIPassword = "KKKC8PY8E4R9LN48";
                profile.APISignature = "AFcWxV21C7fd0v3bYYYRCpSSRl31Ab5GxWPc-1XSb8rJctwNCFHIYb84";
                profile.Environment = "live";
            }
            else
            {
                profile.APIUsername = "sdk-three_api1.sdk.com";
                profile.APIPassword = "QFZCWN5HZM8VBG7Q";
                profile.APISignature = "AVGidzoSQiGWu.lGj3z15HLczXaaAcK6imHawrjefqgclVwBe8imgCHZ";
                profile.Environment = "sandbox";
            }
			caller.APIProfile = profile;

			NVPCodec encoder = new NVPCodec();
			encoder["VERSION"] =  "65.1";	
			encoder["METHOD"] =  "GetExpressCheckoutDetails";

		// Add request-specific fields to the request.
			encoder["TOKEN"] =  token; // Pass the token returned in SetExpressCheckout.

		// Execute the API operation and obtain the response.
			string pStrrequestforNvp= encoder.Encode();
			string pStresponsenvp=caller.Call(pStrrequestforNvp);

			NVPCodec decoder = new NVPCodec();
			decoder.Decode(pStresponsenvp);
            return decoder;
		}
	}
}
