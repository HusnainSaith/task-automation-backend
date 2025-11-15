import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAIService {
  private apiKey: string | undefined;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  async analyzeTaskAssignment(
    taskDetails: { title: string; description: string },
    servicemanSkills: string[][]
  ): Promise<{ bestServicemanIndex: number; reasoning: string }> {
    if (!this.apiKey) {
      // Fallback to simple assignment if no API key
      return { bestServicemanIndex: 0, reasoning: 'Random assignment (no OpenAI key)' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a task assignment AI. Analyze the task and serviceman skills to find the best match. Return only a JSON object with bestServicemanIndex (number) and reasoning (string).'
            },
            {
              role: 'user',
              content: `Task: ${taskDetails.title} - ${taskDetails.description}\nServiceman skills: ${JSON.stringify(servicemanSkills)}\nWhich serviceman (by index) is best suited for this task?`
            }
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return {
        bestServicemanIndex: Math.max(0, Math.min(result.bestServicemanIndex, servicemanSkills.length - 1)),
        reasoning: result.reasoning
      };
    } catch (error) {
      // Fallback to first available serviceman
      return { bestServicemanIndex: 0, reasoning: 'OpenAI analysis failed, using first available' };
    }
  }
}