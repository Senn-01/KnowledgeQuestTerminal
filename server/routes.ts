import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export async function registerRoutes(app: Express): Promise<Server> {
  // OpenAI proxy endpoints
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      
      const difficultyContext = [
        "beginner level with simple explanations and basic examples",
        "introductory level with clear concepts and practical examples", 
        "intermediate level with detailed explanations and real-world applications",
        "advanced level with complex concepts and technical depth",
        "expert level with comprehensive analysis and cutting-edge insights"
      ][difficulty - 1];

      const prompt = `You are an expert teacher explaining "${topic}" at ${difficultyContext}. 

Provide a comprehensive explanation that includes:
1. Clear definition and core concepts
2. Key principles and how they work
3. Real-world examples and applications
4. Important terminology
5. Common misconceptions to avoid

Format your response as clear, engaging content suitable for learning. Make it thorough but accessible for the specified difficulty level.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert educator who explains complex topics clearly and engagingly." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      res.json({ content: response.choices[0].message.content });
    } catch (error) {
      console.error('AI Explanation Error:', error);
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
  });

  app.post('/api/ai/evaluate', async (req, res) => {
    try {
      const { topic, userExplanation } = req.body;
      
      const prompt = `Evaluate this student's explanation of "${topic}":

"${userExplanation}"

Provide a score from 1-10 and specific feedback. Respond in JSON format:
{
  "score": number,
  "feedback": "detailed constructive feedback"
}

Scoring criteria:
- Accuracy of information (40%)
- Completeness of explanation (30%) 
- Clarity and organization (20%)
- Use of appropriate terminology (10%)`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert educator who provides fair, constructive assessment." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{"score": 0, "feedback": "Unable to evaluate"}');
      res.json({
        score: Math.max(1, Math.min(10, result.score)),
        feedback: result.feedback
      });
    } catch (error) {
      console.error('AI Evaluation Error:', error);
      res.status(500).json({ error: 'Failed to evaluate explanation' });
    }
  });

  app.post('/api/ai/quiz', async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      
      const prompt = `Create 10 multiple choice questions about "${topic}" for difficulty level ${difficulty}.

Each question should have 4 options with exactly one correct answer.
Respond in JSON format:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correctAnswer": 0
    }
  ]
}

Make questions progressively challenging and cover key concepts.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert quiz creator who designs fair, educational assessments." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5
      });

      const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
      res.json({ questions: result.questions || [] });
    } catch (error) {
      console.error('Quiz Generation Error:', error);
      res.status(500).json({ error: 'Failed to generate quiz questions' });
    }
  });

  app.post('/api/ai/lightning', async (req, res) => {
    try {
      const { topic } = req.body;
      
      const prompt = `Create 20 true/false statements about "${topic}".

Mix obvious facts with nuanced points to test deep understanding.
Respond in JSON format:
{
  "statements": [
    {
      "statement": "statement text",
      "isTrue": true
    }
  ]
}

Include a variety of difficulty levels from basic facts to subtle distinctions.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert educator creating rapid-fire assessment questions." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6
      });

      const result = JSON.parse(response.choices[0].message.content || '{"statements": []}');
      res.json({ statements: result.statements || [] });
    } catch (error) {
      console.error('Lightning Round Generation Error:', error);
      res.status(500).json({ error: 'Failed to generate lightning round questions' });
    }
  });

  app.post('/api/ai/vault', async (req, res) => {
    try {
      const { session } = req.body;
      
      const prompt = `Create a comprehensive markdown summary for this learning session:

Topic: ${session.topic}
Difficulty: ${session.difficultyName}
Category: ${session.category}
Rarity: ${session.rarity}
Final Score: ${session.finalScore}

Include the AI explanation, user understanding, trial results, and create connections to related topics.

Format as a detailed markdown document suitable for a knowledge vault.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are creating a comprehensive knowledge archive entry." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.4
      });

      res.json({ content: response.choices[0].message.content });
    } catch (error) {
      console.error('Vault Entry Creation Error:', error);
      res.status(500).json({ error: 'Failed to create vault entry' });
    }
  });

  app.post('/api/ai/categorize', async (req, res) => {
    try {
      const { topic } = req.body;
      
      const prompt = `Analyze this topic: "${topic}"

Determine:
1. Which category it belongs to: Sciences, Mathematics, Technology, Humanities, Arts, Skills, or Languages
2. List 3-5 related topics that would connect to this in a knowledge graph

Respond in JSON format:
{
  "category": "category name",
  "connections": ["related topic 1", "related topic 2", ...]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: [
          { role: "system", content: "You are an expert knowledge organizer and topic categorization specialist." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{"category": "Skills", "connections": []}');
      res.json(result);
    } catch (error) {
      console.error('Topic Categorization Error:', error);
      res.json({ category: 'Skills', connections: [] });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
