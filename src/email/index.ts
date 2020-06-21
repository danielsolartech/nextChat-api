import * as sgMail from '@sendgrid/mail';

class EmailManager {
  private message: any;

  constructor() {
    this.message = {};

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  from(type: 'NOREPLY'): EmailManager {
    if (type === 'NOREPLY') {
      this.message.from = {
        name: 'NextChat',
        email: 'noreply@danielsolartech.com',
      };
    }

    return this;
  }

  to(to: string): EmailManager {
    this.message.to = to;
    return this;
  }

  title(title: string): EmailManager {
    this.message.subject = title;
    return this;
  }

  subject(title: string): EmailManager {
    return this.title(title);
  }

  text(text: string): EmailManager {
    if (this.message.html) {
      throw new Error('The e-mail already has HTML content.');
    }

    this.message.text = text;
    return this;
  }

  html(html: string): EmailManager {
    if (this.message.text) {
      throw new Error('The e-mail already has text content.');
    }

    this.message.html = html;
    return this;
  }

  async send(): Promise<void> {
    try {
      if (!this.message) {
        throw new Error('The e-mail content is empty.');
      }

      await sgMail.send(this.message);
      return;
    } catch (error) {
      await Promise.reject(error);
      return;
    }
  }
}

export default EmailManager;
