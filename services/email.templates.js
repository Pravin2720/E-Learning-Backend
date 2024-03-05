const NEW_PASSWORD =
  '<div style="background: #fafafa; padding: 2em 1em; font-size: 16px;">' +
  '<div style="padding: 1.5em; border-radius: 1em; max-width: 640px; margin: auto; background: #fff;">' +
  "<p>Hi @USER,</p>" +
  "<p>We have received a request to reset your password.</p>" +
  "<hr/>" +
  "<p>If you did not make this request, please do not share this link with anyone else.</p>" +
  "<p>Visit <a href='@WEBLINK'>here</a> to reset your account password.</p>";

  const NEWSLETTER = 
  "<p>Hi @USER, </p>" +
  "<p>You have Subscribed to Upsurge.club newsletter</p>";
/**
 * Methods to export above declared email templates
 */

export const createResetLinkText = (user = "Valuationary User", weblink = "www.valuationary.com") => {
  var text = NEW_PASSWORD.replace("@USER", user);
  text = text.replace(/@WEBLINK/g, weblink);
  return text;
};

export const createNewsLetterText = (user = "Upsurge.club User", weblink = "www.upsurge.club") => {
  var text = NEWSLETTER.replace("@USER", user);
  text = text.replace(/@WEBLINK/g, weblink);
  return text;
}