/**
 * Google Auth Callback API Route — Exchanges OAuth2 code for Cognito tokens.
 * Redirects to /dashboard on success.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error } = req.query;

    if (error) {
        console.error('[/api/auth/callback] OAuth error:', error);
        return res.redirect(`/login?error=${encodeURIComponent(error as string)}`);
    }

    if (!code) {
        return res.redirect('/login?error=no_code');
    }

    try {
        const domain = process.env.COGNITO_DOMAIN; // e.g. "creo-ai.auth.us-east-1.amazoncognito.com"
        const clientId = process.env.COGNITO_CLIENT_ID!;
        const clientSecret = process.env.COGNITO_CLIENT_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback`;

        if (!domain) {
            throw new Error('COGNITO_DOMAIN not configured');
        }

        const details: Record<string, string> = {
            grant_type: 'authorization_code',
            client_id: clientId,
            code: code as string,
            redirect_uri: redirectUri,
        };

        const formBody = Object.keys(details)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key]))
            .join('&');

        const headers: Record<string, string> = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        if (clientSecret) {
            const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            headers['Authorization'] = `Basic ${auth}`;
        }

        const tokenRes = await fetch(`https://${domain}/oauth2/token`, {
            method: 'POST',
            headers,
            body: formBody,
        });

        const data = await tokenRes.json();

        if (!tokenRes.ok) {
            console.error('[/api/auth/callback] Token exchange failed:', data);
            return res.redirect(`/login?error=${encodeURIComponent(data.error || 'token_exchange_failed')}`);
        }

        // We can't set localStorage from a server-side redirect.
        // Instead, we'll pass the tokens in the URL or a temporary session cookie.
        // For simplicity in this demo, we'll pass the access token in a query param
        // and have a small script on the dashboard page store it.
        // NOTE: In production, use HttpOnly cookies for better security.

        return res.redirect(`/dashboard?token=${data.access_token}&user=google_user`);
    } catch (err) {
        console.error('[/api/auth/callback] Error:', err);
        return res.redirect('/login?error=internal_server_error');
    }
}
