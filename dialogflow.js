// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Utilities for converting between JSON and goog.protobuf.Struct
const {jsonToStructProto,structProtoToJson} = require("./structjson");

'use strict';
// [START dialogflow_quickstart]

const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');


/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(text, projectId = "projectId") {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  /**
   * Create a new session
   * Use API Key(.json format) as obtained from Google console
   * @param {string} apiKey File path to the key
   */
  const sessionClient = new dialogflow.SessionsClient({keyFilename: "apiKey"});
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  // The text query in coverted into a request format.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: text,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send the request using Dialogflow API and fetch the fulfillmentText with extra payload(if any) in response to the query
  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;

  const res = {};

  res.text = result.fulfillmentText;
  const vResult = structProtoToJson(result.fulfillmentMessages[0].payload);

  if (result["fulfillmentText"] != '') {
    console.log("Inside if");
    res.text = result.fulfillmentText;
    if (result.fulfillmentMessages.length > 1 && result.fulfillmentMessages[1].hasOwnProperty("payload")) {
      console.log("inside nested");
      const vResult = structProtoToJson(result.fulfillmentMessages[1].payload);
      res.attachments = vResult.slack.attachments;
    }
  } else {
    const vResult = structProtoToJson(result.fulfillmentMessages[0].payload);
    res.attachments = vResult.slack.attachments;
  }

  return res
}
// [END dialogflow_quickstart]

module.exports = {
  runSample
}
