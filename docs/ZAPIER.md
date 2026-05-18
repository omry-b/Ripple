# Zapier integration

Ripple customer webhooks use HMAC-SHA256 signatures.

## Register webhook

```bash
curl -X POST https://YOUR_APP/api/subscriptions/webhooks \
  -H "Content-Type: application/json" \
  -H "x-ripple-role: admin" \
  -H "x-ripple-org-id: org_demo" \
  -d '{"url":"https://hooks.zapier.com/hooks/catch/XXXX/yyyy/","events":["alert.critical"]}'
```

Save the returned `signingSecret`.

## Verify in Zapier

1. Trigger: **Webhooks by Zapier** → Catch Hook
2. Use the Ripple subscription URL as your Zapier hook URL (or proxy through Zapier from Ripple deliveries)
3. For inbound verification, compute:
   - `X-Ripple-Timestamp` + body → HMAC-SHA256 with `signingSecret`
   - Compare to `X-Ripple-Signature` header

## Events

| Event | When |
|-------|------|
| `alert.critical` | Critical alert acknowledged or raised |
| `alert.elevated` | Elevated alert |
| `signal.elevated` | Signal threshold (future) |
