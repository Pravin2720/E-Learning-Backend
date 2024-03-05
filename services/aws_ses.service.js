import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Create SES service object.
const sesClient = new SESClient({ region: "ap-south-1" });

function createMailParams(recipients, subject, htmlBody, source, sourceId) {
  return {
    Destination: {
      /* required */
      CcAddresses: [],
      ToAddresses: recipients, //object of emails. ['email1', 'email2']
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: "",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: source + " <"+ sourceId +">" /* required */,
    ReplyToAddresses: [sourceId],
  };
}

async function sendEmail(recipients, subject, htmlBody, source = "Valuationary") {
  try {
    const data = await sesClient.send(new SendEmailCommand(createMailParams(recipients, subject, htmlBody, source, "no-reply@valuationary.com")));
    console.log("Success", data);
    return data; // For unit tests.
  } catch (err) {
    console.error(err, err.stack);
    return false;
  }
}

export const sendEmailUpsurge = async (recipients, subject, htmlBody, source = "UpSurge") => {
  // Create SES service object.
  const sesClientUpsurge = new SESClient({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.UPSURGE_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.UPSURGE_AWS_SECRET_ACCESS_KEY,
    },
  });
  try {
    const data = await sesClientUpsurge.send(new SendEmailCommand(createMailParams(recipients, subject, htmlBody, source, "no-reply@upsurge.club")));
    console.log("Success", data);
    return data; // For unit tests.
  } catch (err) {
    console.error(err);
    return false;
  }
};

export default sendEmail;
