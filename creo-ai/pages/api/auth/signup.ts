/**
 * Signup API Route — Cognito SignUp via AWS SDK
 * Accepts { email, password }, returns { userSub }
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import {
    CognitoIdentityProviderClient,
    SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { calculateSecretHash } from '@/lib/authUtils';

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
        const clientId = process.env.COGNITO_CLIENT_ID!;
        const clientSecret = process.env.COGNITO_CLIENT_SECRET;

        const command = new SignUpCommand({
            ClientId: clientId,
            Username: email,
            Password: password,
            SecretHash: clientSecret ? calculateSecretHash(email, clientId, clientSecret) : undefined,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email,
                },
            ],
        });

        const response = await cognitoClient.send(command);

        return res.status(200).json({
            message: 'User created successfully',
            userSub: response.UserSub,
            confirmed: response.UserConfirmed,
        });
    } catch (error) {
        console.error('[/api/auth/signup] Error:', error);

        const errorName = (error as { name?: string }).name ?? '';
        const message = error instanceof Error ? error.message : 'Signup failed';

        if (errorName === 'UsernameExistsException') {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }
        if (errorName === 'InvalidPasswordException') {
            return res.status(400).json({ error: 'Password does not meet complexity requirements' });
        }
        if (errorName === 'InvalidParameterException') {
            return res.status(400).json({ error: message });
        }

        return res.status(500).json({
            error: `Signup error [${errorName || 'Unknown'}]: ${message}`,
        });
    }
}
