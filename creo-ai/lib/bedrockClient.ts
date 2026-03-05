import {
    BedrockRuntimeClient,
    ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

// Add debug logging (remove sensitive data in production)
if (process.env.NODE_ENV === 'development') {
    console.log('[bedrockClient] AWS Region:', process.env.AWS_REGION);
    console.log('[bedrockClient] AWS Access Key ID exists:', !!process.env.AWS_ACCESS_KEY_ID);
    console.log('[bedrockClient] AWS Secret Access Key exists:', !!process.env.AWS_SECRET_ACCESS_KEY);
    console.log('[bedrockClient] Bedrock Model ID:', process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0');
}

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

        // Provide specific guidance for AWS Access Denied errors
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();

            if (errorMessage.includes('access denied') || errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
                console.error('[bedrockClient] AWS Access Denied - Troubleshooting:');
                console.error('1. Check AWS credentials in .env file');
                console.error('2. Verify IAM user has Bedrock access permissions');
                console.error('3. Ensure AWS region is correct and Bedrock is available there');
                console.error('4. Check if the specific model is available in your region');
                throw new Error('AWS Access Denied: Please check your AWS credentials and Bedrock permissions. See console for details.');
            }

            if (errorMessage.includes('credentials') || errorMessage.includes('could not load credentials')) {
                console.error('[bedrockClient] AWS Credentials Issue - Troubleshooting:');
                console.error('1. Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in .env');
                console.error('2. Verify the credentials are correct and not expired');
                throw new Error('AWS Credentials Error: Please check your AWS credentials configuration. See console for details.');
            }

            if (errorMessage.includes('region') || errorMessage.includes('invalid region')) {
                console.error('[bedrockClient] AWS Region Issue - Troubleshooting:');
                console.error('1. Ensure AWS_REGION is set to a valid region (e.g., us-east-1)');
                console.error('2. Verify Bedrock is available in the specified region');
                throw new Error('AWS Region Error: Please check your AWS region configuration. See console for details.');
            }
        }

        throw error;
    }
}

