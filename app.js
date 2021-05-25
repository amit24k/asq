const {App} = require('@slack/bolt');
const {jsonToStructProto,structProtoToJson} = require("./structjson");
const df = require('./dialogflow');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to all the incoming messages and finds a response from Dialogflow API
app.message(async ({message,say}) => {
  df.runSample(message.text).then(result => {
    say(result)
  })
});

// Listens to the app_home_opened event and displays the relavant information to the user
app.event('app_home_opened', async ({event,client}) => {
  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: {
        "type": "home",
        "blocks": [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "This is the chatbot for *CAP 5100 Human-Computer Interaction*, a graduate course in University of Florida. you can access the <https://sites.google.com/view/ufhcispring2021/home|course schedule and lecture slides here>. "
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "Course Information",
              "emoji": true
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Class time: MWF 4th period (10:40 AM - 11:30 AM)"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "<https://www.google.com/url?q=https%3A%2F%2Fufl.zoom.us%2Fj%2F97671292519%3Fpwd%3DV2NMSnBUejYvcmxHdzlhUmZLbHFGZz09&sa=D&sntz=1&usg=AFQjCNEXjGXoe19BzfUz6NMe8xLSDgeeWw|Class Zoom link>"
            }
          },
          {
            "type": "section",
            "fields": [{
                "type": "mrkdwn",
                "text": "Professor: Benjamin Lok, Ph.D."
              },
              {
                "type": "mrkdwn",
                "text": "Email: lok@ufl.edu"
              },
              {
                "type": "mrkdwn",
                "text": "Teaching Assistant (TA): Mohan Zalake"
              },
              {
                "type": "mrkdwn",
                "text": "Email: mohanzalake@ufl.edu"
              }
            ]
          },
          {
            "type": "divider"
          },
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "Your upcoming assignments",
              "emoji": true
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Project 6 Slides Due"
            },
            "accessory": {
              "type": "datepicker",
              "action_id": "assignment_ddl_1",
              "initial_date": "2021-04-18",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a date",
                "emoji": true
              }
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Project 6 Presentation (Day 1)"
            },
            "accessory": {
              "type": "datepicker",
              "action_id": "assignment_ddl_1",
              "initial_date": "2021-04-19",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a date",
                "emoji": true
              }
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Project 6 Presentation (Day 2)"
            },
            "accessory": {
              "type": "datepicker",
              "action_id": "assignment_ddl_1",
              "initial_date": "2021-04-21",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a date",
                "emoji": true
              }
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Project 6"
            },
            "accessory": {
              "type": "datepicker",
              "action_id": "assignment_ddl_1",
              "initial_date": "2021-04-21",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a date",
                "emoji": true
              }
            }
          }
        ]
      }
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

// Listen for modal button to implement the messsage TA button
app.action('modal_button_click', async ({ack,body,client}) => {
  // Acknowledge the command request
  await ack();

  try {
    // Call views.open with the built-in client
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'message_ta_callback',
        title: {
          type: 'plain_text',
          text: 'Message TA'
        },
        blocks: [

          {
            type: 'input',
            block_id: 'message_ta_block',
            label: {
              type: 'plain_text',
              text: 'Write your message to the TA. Your TA will gather everyone\'s questions and answer FAQs during the class. If your question is specific, TA will message you directly.'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'message_ta_action',
              placeholder: {
                type: "plain_text",
                text: "  "
              },
              multiline: true
            },
            hint: {
              type: "plain_text",
              text: "e.g., what you are working on, what your problem is and what you have tried."
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'NOTE: ASQ is still under development. If you are attending ASQ Bot user study, your message will be sent to the researcher instead of the actual TA. And you will NOT receive any response due to testing restrictions. '
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

//After the Message TA modal is submitted, the user enters their message for the TA
app.view('message_ta_callback', async ({ack,body,view,client}) => {
  // Acknowledge the view_submission event
  await ack();

  // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verifcation of their submission
  const val = view['state']['values']['message_ta_block']['message_ta_action']['value'];
  const user = body['user']['id'];


  // Message to send user
  let msg = `Your submission was successful and your message was: ${val}. The TA will post response during the class or message you directly. `;

  // Save to a DB if needed
  //const results = await db.set(user.input, val);

  // Acknowledge the user
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg
    });
  } catch (error) {
    console.error(error);
  }

});

//Capture the user's button input in Slack via the event type 'block_actions' and query for further information using Dialogflow API
app.action({type: 'block_actions'}, async ({body,ack,say}) => {
  // Acknowledge the action
  await ack();
  df.runSample(body.actions[0].value).then(result => {
    say(result)
  })
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
