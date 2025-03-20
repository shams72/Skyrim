# Database Migrations Workflow

This document outlines the database migration workflow for our project using `migrate-mongo`. It includes everything you need to know to handle schema changes and database migrations effectively. Follow these steps for a smooth migration process.

---

## Overview of the Migration Process

Database migrations allow us to update the database schema (e.g., adding, removing, or modifying fields) safely and consistently. These migrations are handled via the `migrate-mongo` tool, and they ensure the database stays synchronized with the application code.

---

## Typical Workflow for Database Migrations

### **1. Edit the Schema**
1. Open the relevant schema file (e.g., `mapModel.js`).
2. Make the necessary changes to reflect the new requirements.
   - Example: Adding a `description` field to the `mapSchema`:
     ```javascript
     const mongoose = require('mongoose');

     const mapSchema = new mongoose.Schema({
       name: { type: String, required: true },
       coordinates: { type: [Number], required: true },
       description: { type: String }, // New field
     });

     module.exports = mongoose.model('Map', mapSchema);
     ```

### **2. Create a Migration Script**
1. Generate a new migration file:
   ```bash
   npx migrate-mongo create <migration-name>
   ```
   Example:
   ```bash
   npx migrate-mongo create add-description-field
   ```
   This creates a file in the `migrations` directory (e.g., `20250127-123456-add-description-field.js`).

2. Edit the migration file to define the `up` and `down` functions:
   ```javascript
   module.exports = {
     async up(db, client) {
       await db.collection('maps').updateMany({}, { $set: { description: "No description available" } });
     },

     async down(db, client) {
       await db.collection('maps').updateMany({}, { $unset: { description: "" } });
     },
   };
   ```

### **3. Test Locally**
1. Run the migration to test it locally:
   ```bash
   npx migrate-mongo up
   ```
2. Verify the changes in the database.
3. If necessary, roll back the migration:
   ```bash
   npx migrate-mongo down
   ```

### **4. Commit Changes**
Include the following in your commit:
- The updated schema file (e.g., `mapModel.js`).
- The new migration script (e.g., `migrations/20250127-123456-add-description-field.js`).

### **5. Deploy to Staging**
1. **Pipeline Workflow:**
   - The pipeline runs the following steps:
     1. Starts the `backend` container via `docker-compose`.
     2. Executes the `migrate-mongo up` command inside the `backend` container:
        ```bash
        docker exec backend npx migrate-mongo up
        ```
     3. Redeploys the application with the updated schema.

2. **Verification:**
   - Test the application in the staging environment to confirm the changes.

### **6. Deploy to Production**
1. The pipeline runs migrations in the production environment using the same process as staging.
2. Ensure thorough testing is complete before production deployment.

---

## Key Components of the Workflow

### **1. Environment Variables**
The MongoDB connection string (`process.env.MONGO_URI`) must be set correctly for migrations to work.
- Example `MONGO_URI`:
  ```
  mongodb://mongo-1:mongo-1@sre-backend.devops-pse.users.h-da.cloud:27017/MapDatabase
  ```

#### Where to Set It:
1. **In GitLab CI/CD Variables**:
   - Add `MONGO_URI` as a masked variable under **Settings > CI/CD > Variables**.
2. **In a `.env` File**:
   - Use `.env.staging` or `.env.production` on the server to define the variable:
     ```env
     MONGO_URI=mongodb://mongo-1:mongo-1@sre-backend.devops-pse.users.h-da.cloud:27017/MapDatabase
     ```

### **2. Files Involved**
1. **Schema File**:
   - E.g., `mapModel.js` where you define the schema.
2. **Migration Files**:
   - Stored in the `migrations` directory, created via `migrate-mongo`.
3. **Pipeline Configuration**:
   - The `.gitlab-ci.yml` file ensures migrations are applied during deployment.

### **3. Pipeline Configuration**
In the `deploy-staging` stage:
```yaml
deploy-staging:
  stage: deploy
  script:
    # Start the backend container and run migrations
    - ssh -o StrictHostKeyChecking=no -i /root/.ssh/deploy_key $DEPLOYMENT_USER@$DEPLOYMENT_SERVER "
        docker-compose -f docker-compose.yml -p staging up -d backend &&
        sleep 10 &&
        docker exec backend npx migrate-mongo up
      "

    # Redeploy the application
    - ssh -o StrictHostKeyChecking=no -i /root/.ssh/deploy_key $DEPLOYMENT_USER@$DEPLOYMENT_SERVER "
        docker-compose --env-file .env.staging -p staging down &&
        docker-compose --env-file .env.staging -p staging pull &&
        docker-compose --env-file .env.staging -p staging up -d
      "
```

---

## Key Considerations

### **Backward Compatibility**
- Ensure the application works with both old and new schemas during the migration.
- Use feature flags if necessary.

### **Destructive Changes**
- Avoid dropping fields or collections unless you are certain they are no longer needed.
- Backup the database before applying destructive changes.

---

## Troubleshooting

### **Common Issues**
1. **`migrate-mongo` Not Installed:**
   - Ensure `migrate-mongo` is in the `dependencies` of `package.json` and included in the Docker image.
2. **Database Connection Errors:**
   - Verify that `MONGO_URI` is correctly set and accessible.
3. **Pending Migrations Not Detected:**
   - Ensure the migration file is in the correct `migrations` directory.

### **Verification Commands**
- Check migration status:
  ```bash
  npx migrate-mongo status
  ```
- Test the connection manually:
  ```bash
  docker exec backend npx migrate-mongo status
  ```

---

With this workflow, you can confidently handle database migrations while ensuring the stability and consistency of the application.

