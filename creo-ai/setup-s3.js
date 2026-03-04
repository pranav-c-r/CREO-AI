// setup-s3.js
import { S3Client, CreateBucketCommand, PutPublicAccessBlockCommand, PutBucketPolicyCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const region = process.env.AWS_REGION || 'us-east-1';

const client = new S3Client({
    region: region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function main() {
    const bucketName = `creo-ai-images-${randomUUID().substring(0, 8)}`;
    console.log(`Creating S3 bucket: ${bucketName} in region ${region}`);

    try {
        // 1. Create Bucket
        await client.send(new CreateBucketCommand({
            Bucket: bucketName,
            CreateBucketConfiguration: region === 'us-east-1' ? undefined : {
                LocationConstraint: region,
            },
            ObjectOwnership: 'BucketOwnerPreferred',
        }));
        console.log(`Successfully created bucket: ${bucketName}`);

        // Wait 2 seconds for bucket to propagate mentally
        await new Promise(r => setTimeout(r, 2000));

        // 2. Disable Block Public Access
        await client.send(new PutPublicAccessBlockCommand({
            Bucket: bucketName,
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: false,
                IgnorePublicAcls: false,
                BlockPublicPolicy: false,
                RestrictPublicBuckets: false,
            },
        }));
        console.log(`Disabled block public access for bucket: ${bucketName}`);

        // Wait 2 seconds
        await new Promise(r => setTimeout(r, 2000));

        // 3. Add Bucket Policy for Public Read
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicReadGetObject',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: 's3:GetObject',
                    Resource: `arn:aws:s3:::${bucketName}/*`,
                },
            ],
        };

        await client.send(new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: JSON.stringify(policy),
        }));
        console.log(`Added public read policy to bucket.`);

        // 4. Add CORS for frontend access
        await client.send(new PutBucketCorsCommand({
            Bucket: bucketName,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ['*'],
                        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                        AllowedOrigins: ['*'],
                        ExposeHeaders: ['ETag'],
                        MaxAgeSeconds: 3000,
                    },
                ],
            },
        }));
        console.log(`Added CORS configuration to bucket.`);

        // 5. Save to .env
        const envContent = fs.readFileSync('.env', 'utf-8');
        const newEnvContent = envContent + `\n# S3 Configuration\nS3_BUCKET_NAME=${bucketName}\n`;
        fs.writeFileSync('.env', newEnvContent);
        console.log(`Saved S3_BUCKET_NAME=${bucketName} to .env`);

    } catch (e) {
        console.error(`Failed to setup S3: ${e.message}`, e);
    }
}

main();
