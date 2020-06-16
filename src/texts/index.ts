import Text, { Lang } from '@Models/text';
import NextChat from '@NextChat';

class TextsManager {
  async getByName(name: string): Promise<Text[]> {
    return await NextChat.getDatabase().getTexts().find({
      name,
    });
  }

  async getByLang(lang: Lang): Promise<Text[]> {
    return await NextChat.getDatabase().getTexts().find({
      lang,
    });
  }

  async getValue(name: string, lang: Lang): Promise<string> {
    const text: Text = await NextChat.getDatabase().getTexts().findOne({
      name,
      lang,
    });

    return text ? text.value : '';
  }

  async create(name: string, lang: Lang, value: string): Promise<Text> {
    if (!name || !name.length || !lang || !value || !value.length) {
      return null;
    }

    const text: Text = new Text();

    text.name = name;
    text.lang = lang;
    text.value = value;

    return await this.save(text);
  }

  async save(text: Text): Promise<Text> {
    return await NextChat.getDatabase().getTexts().save(text);
  }
}

export default TextsManager;
