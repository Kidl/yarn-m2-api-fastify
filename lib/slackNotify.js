const notify = require('slack-notify')(process.env.SLACK_WEBHOOK_URL)
  .extend({ channel: process.env.SLACK_CHANNEL });

function slackNotify(message) {
  if (typeof message === 'string') {
    message = {
      blocks:[
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
      ]
    };
  }

  notify(message);
}

module.exports = slackNotify;
