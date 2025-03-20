# How deployment works.
Short documentation about the deployment process for us.

This document contains sensitive information (e.g., DB credentials, ports). While acceptable for this project due to shared access among students, a larger project would require stricter documentation practices (Obviously). 

## On the Deployment Server:
The server uses its own `docker-compose.yml` to launch our application components.
It uses environment-specific `.env` files (`.env.staging` or `.env.production`) for configuration.
### For example the `.env.production` looks like this:
```
ENV=production
BACKEND_PORT=4243
FRONTEND_PORT=4242
NAVIGATION_PORT=50051
```

### Here is the current server-side `docker-compose.yml` (as of 13.12.2024, SUBJECT TO CHANGE):
```yaml
backend:
    image: registry.code.fbi.h-da.de/bpse-wise2425/group1/skyrim-app/backend
    container_name: backend-${ENV}
    environment:
        MONGO_URI: "mongodb://mongo-1:mongo-1@sre-backend.osnet.h-da.cloud:27017"
        NODE_ENV: production
    ports:
        - "${BACKEND_PORT}:5000"

frontend:
    image: registry.code.fbi.h-da.de/bpse-wise2425/group1/skyrim-app/frontend
    container_name: frontend-${ENV}
    environment:
        NODE_ENV: production
    ports:
        - "${FRONTEND_PORT}:3000"

navigation-service:
    image: registry.code.fbi.h-da.de/bpse-wise2425/group1/skyrim-app/navigation
    container_name: navigation-service-${ENV}
    environment:
        NODE_ENV: production
    ports:
        - "${NAVIGATION_PORT}:50051"
```

These variables configure ports and other settings for docker-compose to ensure correct component setup and port mapping.

## Deployment Steps (example for production):

Following these steps will sucessfully deploy the latest images in our repository (containers can be viewed under Deploy > Container Registry).

1. **Connect to the deployment server via SSH.**
2. **View existing service (and what ports they are mapped to)**: `docker ps`
3. **Stop existing services (down)**: `docker-compose --env-file .env.production -p production down`
4. **Pull updated images from our repo (pull)**: `docker-compose --env-file .env.production -p production pull`
5. **Start updated services (up -d)**: `docker-compose --env-file .env.production -p production pull`

The ENV variable determines whether the staging or production .env file is used.