# Local infrastructure

Redis and MinIO run as Docker containers and bind to localhost only.

```powershell
docker compose --env-file docker/.env -f docker/docker-compose.yml up -d
docker compose --env-file docker/.env -f docker/docker-compose.yml ps
docker compose --env-file docker/.env -f docker/docker-compose.yml down
```

Development endpoints:

- Redis: `127.0.0.1:6379`
- MinIO S3 API: `http://127.0.0.1:9000`
- MinIO Console: `http://127.0.0.1:9001`
- Private bucket: `pet-health-assets`

The local credentials are stored in the ignored `docker/.env` file. Replace
them before any shared or production deployment.
