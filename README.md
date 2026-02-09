# Deployment

This project uses GitHub Actions to automatically deploy to Aliyun OSS + CDN.

## GitHub Secrets

Configure the following secrets in **Repository Settings → Secrets and variables → Actions**:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `ALIYUN_ACCESS_KEY_ID` | Aliyun Access Key ID | `LTAI5txxxx...` |
| `ALIYUN_ACCESS_KEY_SECRET` | Aliyun Access Key Secret | `xxxxx...` |
| `ALIYUN_BUCKET_NAME` | OSS Bucket name | `my-bucket` |
| `ALIYUN_REGION` | OSS Region code | `cn-hangzhou` |
| `CDN_URL` | CDN加速域名 (含协议) | `https://cdn.example.com` |
