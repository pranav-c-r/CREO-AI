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

        // Extract JSON from the model text (handle various formats)
        let jsonMatch = textContent.match(/```json\s*([\s\S]*?)```/)
            || textContent.match(/```\s*([\s\S]*?)```/)
            || textContent.match(/{[\s\S]*}/);

        if (!jsonMatch) {
            // Try to find JSON-like structure more aggressively
            const lines = textContent.split('\n');
            for (const line of lines) {
                if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
                    jsonMatch = [line, line];
                    break;
                }
            }
        }

        if (!jsonMatch) {
            // Last resort: try to parse the entire response as JSON
            try {
                return JSON.parse(textContent.trim()) as T;
            } catch {
                throw new Error(`No JSON found in model response. Response was: "${textContent.substring(0, 200)}..."`);
            }
        }

        let extractedJson = jsonMatch[1] || jsonMatch[0];

        // Clean up the extracted JSON
        extractedJson = extractedJson
            .replace(/^[^{]*/, '')  // Remove anything before the first {
            .replace(/[^}]*$/, '')  // Remove anything after the last }
            .trim();

        // Sanitize: escape unescaped control characters inside JSON string values.
        extractedJson = extractedJson.replace(/("(\\[^]|[^"\\])*")/g, (match) => {
            return match
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
        });

        try {
            return JSON.parse(extractedJson) as T;
        } catch (parseError) {
            console.error('[bedrockClient] JSON parse error:', parseError);
            console.error('[bedrockClient] Extracted JSON:', extractedJson);
            throw new Error(`Failed to parse JSON from model response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
    } catch (error) {
        console.error('[bedrockClient] Error:', error);
        throw error;
    }
}

