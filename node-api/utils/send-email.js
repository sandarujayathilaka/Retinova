async function sendEmail(to, subject, body) {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: { Data: body },
      },
      Subject: { Data: subject },
    },
    Source: "email@xyz.com",
  };

  return {};
}

module.exports = { sendEmail };
