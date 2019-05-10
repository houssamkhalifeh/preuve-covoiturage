import { Interfaces, Providers, Container } from '@pdc/core';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

@Container.provider()
export class HandlebarsProvider implements Interfaces.ProviderInterface {
  protected templates: Map<string, Function> = new Map();
  protected metadata: Map<string, any> = new Map();

  constructor(private configProvider: Providers.ConfigProvider) {}

  async boot(): Promise<void> {
    const templateDirectory = this.configProvider.get('template.templateDirectory');
    const metadata = this.configProvider.get('template.metadata');

    const templatePath = path.resolve(process.cwd(), templateDirectory);
    if (fs.existsSync(templatePath)) {
      fs.readdirSync(templatePath, 'utf8').forEach((basename) => {
        const filename = `${templatePath}/${basename}`;
        const fileinfo = path.parse(filename);
        if (['.handlebars', '.hbs'].indexOf(fileinfo.ext) > -1) {
          this.set(fileinfo.name, fs.readFileSync(filename, 'utf8'));
          if (fileinfo.name in metadata) {
            this.setMetadata(fileinfo.name, metadata[fileinfo.name]);
          }
        }
      });
    }
  }

  setMetadata(templateName: string, metadata: any):void {
    this.metadata.set(templateName, metadata);
  }

  getMetadata(templateName: string):any {
    if (this.metadata.has(templateName)) {
      return this.metadata.get(templateName);
    }
    return;
  }

  set(templateName: string, template: string): void {
    this.templates.set(templateName, handlebars.compile(template));
  }

  get(templateName: string, opts: any): string {
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName)(opts);
    }
    throw new Error(`Template ${templateName} not found`);
  }
}