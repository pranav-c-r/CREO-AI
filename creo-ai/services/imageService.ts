import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { invokeModel as invokeTextModel } from '@/lib/bedrockClient';

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.S3_BUCKET_NAME!;
const IMAGE_MODEL_ID = process.env.IMAGE_MODEL_ID || 'amazon.nova-canvas-v1:0';

const bedrockClient = new BedrockRuntimeClient({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

async function uploadToS3(base64Data: string): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');
    const key = `images/${randomUUID()}.jpeg`;

    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg',
    }));

    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Uses the text LLM to translate a social media post into a concise,
 * high-quality visual image generation prompt before calling Nova Canvas.
 */
async function buildImagePrompt(postContent: string): Promise<string> {
    const textPrompt = `You are an expert AI image generation prompt engineer specializing in high quality photorealistic image generation.
Your task: Read the social media post below and write a vivid, highly-descriptive image prompt (max 70 words) that captures the core subject, setting, mood, and visual style.
Guidelines:
- Focus on photographic realism, cinematic composition, dramatic or natural lighting.
- Include a specific setting or environment relevant to the topic of the post.
- Do NOT include text, words, letters, or watermarks inside the image prompt.
- Avoid faces unless essential to the concept; focus on environments, objects, or scenes for best quality.

Social Media Post:
"${postContent}"

Return ONLY valid JSON in this exact format (no markdown blocks or explanations, just the JSON). Ensure that any newlines or quotes inside string values are properly escaped (e.g. \\n):
{
  "image_prompt": "your vivid, cinematic image prompt here"
}`;

    const llmResult = await invokeTextModel<{ image_prompt: string }>(textPrompt);
    const prompt = llmResult.image_prompt || 'cinematic wide shot, realistic, dramatic lighting, 4k professional photography';

    console.log(`[imageService] LLM-crafted image prompt: "${prompt}"`);
    return prompt;
}

/**
 * Generates a high-quality image using Amazon Nova Canvas via Bedrock.
 * Nova Canvas uses the same request format as Titan Image Generator G1.
 */
export async function generateImage(postContent: string): Promise<string> {
    const optimizedPrompt = await buildImagePrompt(postContent);

    const body = {
        taskType: 'TEXT_IMAGE',
        textToImageParams: {
            text: optimizedPrompt,
            negativeText: 'text, watermark, logo, letters, words, ugly, blurry, low quality, distorted, bad anatomy',
        },
        imageGenerationConfig: {
            numberOfImages: 1,
            height: 1024,
            width: 1024,
            cfgScale: 8.0,
            quality: 'premium',
        },
    };

    const command = new InvokeModelCommand({
        modelId: IMAGE_MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: Buffer.from(JSON.stringify(body)),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (!responseBody.images || responseBody.images.length === 0) {
        throw new Error('No image returned from Nova Canvas');
    }

    return await uploadToS3(responseBody.images[0]);
}

/**
 * Creates a variation of a user-uploaded image using Nova Canvas IMAGE_VARIATION task.
 */
export async function modifyImage(base64Image: string, prompt: string): Promise<string> {
    // Strip data URL prefix if present e.g. data:image/jpeg;base64,
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const body = {
        taskType: 'IMAGE_VARIATION',
        imageVariationParams: {
            images: [cleanBase64],
            text: prompt,
            negativeText: 'text, watermark, logo, ugly, blurry, low quality, distorted',
            similarityStrength: 0.7, // 0.2 (very different) to 1.0 (very similar to reference)
        },
        imageGenerationConfig: {
            numberOfImages: 1,
            height: 1024,
            width: 1024,
            cfgScale: 8.0,
        },
    };

    const command = new InvokeModelCommand({
        modelId: IMAGE_MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: Buffer.from(JSON.stringify(body)),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (!responseBody.images || responseBody.images.length === 0) {
        throw new Error('No image returned from Nova Canvas');
    }

    return await uploadToS3(responseBody.images[0]);
}
