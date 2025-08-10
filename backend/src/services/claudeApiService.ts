
type ClaudeResponse = {
  text: string;
};

type ClaudeRequest = {
  model: string;
  messages: { role: 'user' | 'assistant'; content: string | MessageContent[] }[];
  temperature?: number;
  max_tokens?: number;
};

type MessageContent = {
  type: 'text' | 'image';
  source?: {
    type: 'base64' | 'file';
    media_type: string;
    data: string;
  };
  text?: string;
};

class ClaudeService {
  private apiKey: string;
  private apiUrl: string;

    constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY || '';
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
  }


  public async sendRequest(prompt: string): Promise<string> {
    const request: ClaudeRequest = {
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],

    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const responseBody = await response.text();
        console.log("RESPONSE BODY : ", responseBody);
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      // @ts-ignore
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error('Failed to communicate with Claude AI API');
    }
  }
}

export const claudeService = new ClaudeService();

