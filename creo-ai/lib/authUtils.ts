import { createHmac } from 'crypto';

/**
 * Calculates the Cognito SECRET_HASH required when an App Client has a secret.
 * Formula: Base64(HMAC-SHA256(key: ClientSecret, message: Username + ClientId))
 */
export function calculateSecretHash(username: string, clientId: string, clientSecret: string): string {
    return createHmac('sha256', clientSecret)
        .update(username + clientId)
        .digest('base64');
}
