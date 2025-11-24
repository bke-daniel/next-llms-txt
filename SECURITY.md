# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of `next-llms-txt` seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT

- Open a public GitHub issue for the vulnerability
- Disclose the vulnerability publicly before it has been addressed

### Please DO

1. **Email your findings to:** <npm-security@bke-consulting.com>
2. **Provide detailed information** including:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)

### What to expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Updates**: We will send you regular updates about our progress
- **Timeline**: We aim to address critical vulnerabilities within 7 days
- **Credit**: If you wish, we will credit you in the security advisory

## Security Best Practices

When using `next-llms-txt`, we recommend:

1. **Keep dependencies updated**: Regularly update to the latest version
2. **Review auto-discovery settings**: In production, disable `showWarnings` and limit discovery scope
3. **Validate user input**: If accepting dynamic configuration, validate all inputs
4. **Use HTTPS**: Ensure `baseUrl` uses HTTPS in production
5. **Review permissions**: Limit file system access to necessary directories only

## Security Considerations

### Auto-Discovery

The auto-discovery feature scans your filesystem for page files. Consider:

- Limiting `appDir` and `pagesDir` to specific directories
- Disabling auto-discovery in sensitive environments
- Reviewing discovered routes before production deployment

### Content Exposure

`llms.txt` exposes your site structure to AI systems. Consider:

- Only including public pages in your `llms.txt`
- Excluding sensitive routes or admin pages
- Using manual configuration for fine-grained control

### Dependencies

We regularly audit and update our dependencies. Run:

```bash
npm audit
```

to check for known vulnerabilities in your installation.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible
5. Publish a security advisory on GitHub

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue to discuss.
