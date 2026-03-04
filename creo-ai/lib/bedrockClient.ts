import {
    BedrockRuntimeClient,
    ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * Invoke a text model via Bedrock (Converse API) and return parsed JSON.
 * @param prompt - The full prompt string telling the model to return JSON
 * @returns Parsed JSON object from model's response
 * @throws Error if model invocation or JSON parsing fails
 */
export async function invokeModel<T>(prompt: string): Promise<T> {
    const modelId = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

    try {
        const command = new ConverseCommand({
            modelId,
            messages: [
                {
                    role: 'user',
                    content: [{ text: prompt }],
                },
            ],
            inferenceConfig: {
                maxTokens: 2048,
                temperature: 0,
            },
        });

        const response = await bedrockClient.send(command);

        if (!response.output?.message?.content?.[0]?.text) {
            throw new Error('Empty response from Bedrock model');
        }

        const textContent = response.output.message.content[0].text;

        // Extract JSON from the model text (handle markdown code blocks)
        const jsonMatch = textContent.match(/```json\s*([\s\S]*?)```/)
            || textContent.match(/({[\s\S]*})/);

        if (!jsonMatch) {
            throw new Error(`No JSON found in model response: ${textContent}`);
        }

        let extractedJson = jsonMatch[1] || jsonMatch[0];

        // Sanitize: escape unescaped control characters inside JSON string values.
        // This regex perfectly captures string literals, then we escape newlines/tabs within them.
        extractedJson = extractedJson.replace(/("(\\[^]|[^"\\])*")/g, (match) => {
            return match
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
        });

        return JSON.parse(extractedJson) as T;
    } catch (error) {
        console.error('[bedrockClient] Error:', error);
        throw error;
    }
}

