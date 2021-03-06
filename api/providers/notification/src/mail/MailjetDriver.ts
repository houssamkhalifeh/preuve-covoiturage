import nodeMailjet from 'node-mailjet';

import { MailDriverInterface, MailInterface, SendOptionsInterface } from '../interfaces';

interface MailjetConnectOptionsInterface {
  version: string;
  perform_api_call: boolean;
}

export class MailjetDriver implements MailDriverInterface {
  protected mj: nodeMailjet.Email.Client;
  protected config;
  constructor(
    generalConfig: {
      debug: boolean;
      from: {
        email: string;
        name: string;
      };
      defaultSubject: string;
    },
    driverConfig: {
      public: string;
      private: string;
      options: MailjetConnectOptionsInterface;
    },
  ) {
    this.config = generalConfig;
    const connectOptions: MailjetConnectOptionsInterface = driverConfig.options;
    this.mj = nodeMailjet.connect(driverConfig.public, driverConfig.private, {
      version: 'v3.1',
      ...connectOptions,
    });
  }

  // TODO : create an interface for the return type ?
  async send(mail: MailInterface, opts: Partial<SendOptionsInterface> = {}): Promise<any> {
    try {
      const { email, fullname, subject, content } = mail;

      let message: any = {
        From: {
          Email: this.config.from.email,
          Name: this.config.from.name,
        },
        To: [
          {
            Email: email,
            Name: fullname,
          },
        ],
        Subject: subject || this.config.defaultSubject,
        TrackOpens: 'disabled',
        TrackClicks: 'disabled',
      };

      // disable email tracking to avoid rewriting URLs
      // with a Mailjet unsecured HTTP proxy
      if (opts.disableTracking) {
        message['TrackOpens'] = 'disabled';
        message['TrackClicks'] = 'disabled';
      }

      if ('template' in opts) {
        message = {
          ...message,
          TemplateID: parseInt(opts.template, 10),
          TemplateLanguage: true,
          Variables: {
            content,
            title: subject || this.config.defaultSubject,
          },
          SandboxMode: !this.config.debug,
        };
      }

      return this.mj.post('send').request({ Messages: [message] });
    } catch (e) {
      console.error(e.message, { ...e });
      throw e;
    }
  }
}
