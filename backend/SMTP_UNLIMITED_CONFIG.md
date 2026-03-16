# SMTP Unlimited Connections Configuration

## Current Configuration (Higher Limits)
The MailHelper now supports up to 10 concurrent connections by default, which should handle most high-volume scenarios.

## Environment Variables for Unlimited Connections

### Option 1: High Connection Limits
```env
# Basic SMTP settings
SMTP_HOST=144.208.74.223
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=crm@zavzaseal.com
SMTP_PASS=your_password
SMTP_FROM=crm@zavzaseal.com

# High connection limits
SMTP_MAX_CONNECTIONS=50
SMTP_MAX_MESSAGES=1000
SMTP_RATE_LIMIT=20
```

### Option 2: Disable Connection Pooling (Unlimited)
```env
# Basic SMTP settings
SMTP_HOST=144.208.74.223
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=crm@zavzaseal.com
SMTP_PASS=your_password
SMTP_FROM=crm@zavzaseal.com

# Disable pooling for unlimited connections
SMTP_NO_POOL=true
```

## Important Notes

⚠️ **Server Limitations**: The "421 Too many concurrent SMTP connections" error comes from your SMTP server (144.208.74.223), not your application. The server itself limits concurrent connections.

### Recommended Settings by Use Case:

**Low Volume (1-10 emails/minute):**
```env
SMTP_MAX_CONNECTIONS=5
SMTP_MAX_MESSAGES=50
SMTP_RATE_LIMIT=2
```

**Medium Volume (10-100 emails/minute):**
```env
SMTP_MAX_CONNECTIONS=10
SMTP_MAX_MESSAGES=100
SMTP_RATE_LIMIT=5
```

**High Volume (100+ emails/minute):**
```env
SMTP_MAX_CONNECTIONS=25
SMTP_MAX_MESSAGES=500
SMTP_RATE_LIMIT=10
```

**Unlimited (if server allows):**
```env
SMTP_NO_POOL=true
```

## Testing Your Configuration

Run the test script to verify your settings:

```bash
cd /home/reactzavzaseal/public_html/backend
node test-email-fix.js
```

## Troubleshooting

1. **Still getting 421 errors?**
   - Your SMTP server has strict limits
   - Try reducing `SMTP_MAX_CONNECTIONS`
   - Increase `SMTP_RATE_LIMIT` delay

2. **Want truly unlimited?**
   - Set `SMTP_NO_POOL=true`
   - Each email will create a new connection
   - May be slower but no connection limits

3. **Performance issues?**
   - Use connection pooling (`SMTP_NO_POOL=false`)
   - Adjust `SMTP_MAX_CONNECTIONS` based on server capacity
   - Monitor server logs for optimal settings

## Server-Side Considerations

Contact your SMTP provider (whoever manages 144.208.74.223) to:
- Increase server-side connection limits
- Understand their rate limiting policies
- Get recommendations for your use case
