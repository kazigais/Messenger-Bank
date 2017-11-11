const request = require('request');
const fetch = require('fetch');
const Wit = require('node-wit').Wit;
const log = require('node-wit').log;
const FB_PAGE_TOKEN = "EAAVB0t4bEicBALzuAuzCqcWUiUb8qStGfZBQh8SDtPThfDacRxnoAfXYEkrZA5ZBpjT2CYZCeBIadIiCpJ66tz5Pg9egKTCnqyaraTIVND9vzSbaKJrmcKwAzDXkuneICNzF4XhwBsdmed88FSdgXHC8ZCDE50ymiPRZBEDXEsS8jESSfsHfyo";
const WIT_TOKEN = "ZNAZKF2XUKTFS2G7ZLLBGDHJMB6DC4AP";

// ----------------------------------------------------------------------------
// Messenger API specific code

// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference

const fbMessage = (id, text) => {
  const body = JSON.stringify({
    recipient: { id },
    message: { text },
  });
  const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
  return fetch('https://graph.facebook.com/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
  })
  .then(rsp => rsp.json())
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
};

// ----------------------------------------------------------------------------
// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};

// Our bot actions
const actions = {
  send({sessionId}, {text}) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      // We return a promise to let our bot know when we're done sending
      return fbMessage(recipientId, text)
      .then(() => null)
      .catch((err) => {
        console.error(
          'Oops! An error occurred while forwarding the response to',
          recipientId,
          ':',
          err.stack || err
        );
      });
    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  }
  // You should implement your custom actions here
  // See https://wit.ai/docs/quickstart
};

// Setting up our bot
const wit = new Wit({
  accessToken: WIT_TOKEN,
  logger: new log.Logger(log.INFO)
});


exports.get = function(req, res){
  if (req.query['hub.verify_token'] === 'EAAVB0t4bEicBALzuAuzCqcWUiUb8qStGfZBQh8SDtPThfDacRxnoAfXYEkrZA5ZBpjT2CYZCeBIadIiCpJ66tz5Pg9egKTCnqyaraTIVND9vzSbaKJrmcKwAzDXkuneICNzF4XhwBsdmed88FSdgXHC8ZCDE50ymiPRZBEDXEsS8jESSfsHfyo') {
		console.log(req.query['hub.challenge']);
		console.log(req.query['hub.challenge'][0]);
		res.contentType = "text/plain";
		res.send(req.query['hub.challenge'])
		return;
	}
	res.send('Error, wrong token')
}
exports.post = function(req, res) {
  // Parse the Messenger payload
  // See the Webhook reference
  // https://developers.facebook.com/docs/messenger-platform/webhook-reference
  const data = req.body;

  if (data.object === 'page') {
    data.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message && !event.message.is_echo) {
          // Yay! We got a new message!
          // We retrieve the Facebook user ID of the sender
          const sender = event.sender.id;

          // We retrieve the user's current session, or create one if it doesn't exist
          // This is needed for our bot to figure out the conversation history
          const sessionId = findOrCreateSession(sender);

          // We retrieve the message content
          const {text, attachments} = event.message;

          if (attachments) {
            // We received an attachment
            // Let's reply with an automatic message
            fbMessage(sender, 'Sorry I can only process text messages for now.')
            .catch(console.error);
          } else if (text) {
            // We received a text message
						wit.message(text, sessions[sessionId].context)
						.then((body) => {
							console.log(body.entities);
							console.log(sessions[sessionId].fbid);
							const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
							request('https://graph.facebook.com/v2.9/'+ sessions[sessionId].fbid+'?fields=id,gender,email&' + qs, function (error, response, body) {
							  console.log('error:', error); // Print the error if one occurred
							  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
							  console.log('body:', body); // Print the HTML for the Google homepage.
							});
						})
						.catch(console.error);

            // Let's forward the message to the Wit.ai Bot Engine
            // This will run all actions until our bot has nothing left to do
            // wit.runActions(
            //   sessionId, // the user's current session
            //   text, // the user's message
            //   sessions[sessionId].context // the user's current session state
            // ).then((context) => {
            //   // Our bot did everything it has to do.
            //   // Now it's waiting for further messages to proceed.
            //   console.log('Waiting for next user messages');

            //   // Based on the session state, you might want to reset the session.
            //   // This depends heavily on the business logic of your bot.
            //   // Example:
            //   // if (context['done']) {
            //   //   delete sessions[sessionId];
            //   // }

            //   // Updating the user's current session state
            //   sessions[sessionId].context = context;
            // })
            // .catch((err) => {
            //   console.error('Oops! Got an error from Wit: ', err.stack || err);
            // })
          }
        } else {
          console.log('received event', JSON.stringify(event));
        }
      });
    });
  }
  res.send(200);
}
