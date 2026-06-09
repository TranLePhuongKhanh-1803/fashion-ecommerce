<?php
/**
 * Simple JWT Helper (no external dependency)
 * Uses HMAC-SHA256 for signing
 */
class JWT
{
    /**
     * Encode payload into JWT token
     */
    public static function encode($payload, $secret)
    {
        $header = self::base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        
        // Add standard claims
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        
        $payload = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );
        
        return "$header.$payload.$signature";
    }

    /**
     * Decode and verify JWT token
     * Returns payload array or false on failure
     */
    public static function decode($token, $secret)
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        [$header, $payload, $signature] = $parts;

        // Verify signature
        $expectedSig = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );

        if (!hash_equals($expectedSig, $signature)) {
            return false; // Invalid signature
        }

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!$data) return false;

        // Check expiration
        if (isset($data['exp']) && time() > $data['exp']) {
            return false; // Token expired
        }

        return $data;
    }

    private static function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data)
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
