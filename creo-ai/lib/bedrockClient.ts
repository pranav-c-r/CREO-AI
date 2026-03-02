/**
 * Amazon Bedrock Runtime client + helper to invoke Claude model.
 * All prompts must request strict JSON responses for reliable parsing.
 */
import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * Invoke Claude via Bedrock and return parsed JSON.
 * @param prompt - The full prompt string telling Claude to return JSON
 * @returns Parsed JSON object from Claude's response
 * @throws Error if model invocation or JSON parsing fails
 */
export async function invokeModel<T>(prompt: string): Promise<T> {
    const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';

    const body = JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
    });

    let rawText = '';
    try {
        const command = new InvokeModelCommand({
            modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: Buffer.from(body),
        });

        const response = await bedrockClient.send(command);
        rawText = new TextDecoder().decode(response.body);

        const parsed = JSON.parse(rawText);
        // Claude response content is in parsed.content[0].text
        const textContent: string = parsed.content[0].text;

        // Extract JSON from the model text (handle markdown code blocks)
        const jsonMatch = textContent.match(/```json\s*([\s\S]*?)```/)
            || textContent.match(/({[\s\S]*})/);

        if (!jsonMatch) {
            throw new Error(`No JSON found in model response: ${textContent}`);
        }

        const extractedJson = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(extractedJson) as T;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Failed to parse JSON from Bedrock response: ${rawText}`);
        }
        throw error;
    }
}
