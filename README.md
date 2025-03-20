## Welcome to our BPSE DevOps Skyrim Map Project!

## Startup Guide

### How to get started (locally)

1. Ensure you have **Docker** and **npm** installed on your machine.
2. Go to the repository root - every CLI command should be carried out from here.
3. Run `docker-compose up -d --build` to get the services up and running.
4. Service accessibility: Frontend is hosted on **http://localhost:3000**; while backend, navigation service and Mongo Express UI are hosted on ports **5000**, **50051** and **8081** respectively.
5. For more details on dependency management, testing, debugging and linting, go [here](./doc/config.md).

### Observability

1. Logs: console output, can be seen by using the command `docker logs *service-name*-production` in our SSH server.  
For documentation regarding our logs, refers [here](./doc/logs.md).
2. Traces: visualized in [Jaeger UI](https://jaeger.group1.proxy.devops-pse.users.h-da.cloud/). Sufficient authentication is required to log into the site.  
For documentation regarding our traces, refers [here](./doc/traces.md).
3. Metrics: visualized in [Grafana UI](https://grafana.group1.proxy.devops-pse.users.h-da.cloud/). Sufficient authentication is required to log into the site.  
For documentation regarding our metrics, refers [here](./doc/metrics.md).

### Common issues

- `node:latest` causes delay in the local build process: We have noticed using `node:latest` (or `node:22`) introduces a huge wait time for the build process locally (approximately 20 minutes), instead with `node:18` this issue does not exist. There are minimal differences between the 22 and 18 versions which do not matter hugely to our project, so there are virtually no downsides to using this workaround.
- For our current backend tests to run correctly, it is recommended to always (re)build the containers before running `npm test`. This is due to a yet unknown issue in our code that deletes the map data in our Mongo database after the tests finish running. 
- Our deployment process inside the SSH server requires for dangling images after each rebuild to be removed using `docker prune`, else deployment will fail due to insufficent storage.

## Other documentation for the project

1. [Project Rules](./doc/rules.md)
2. [Commit Conventions](./doc/commit_conventions.md)
3. [Project Configurations](./doc/config.md)
4. [Architecture Design Record](./doc/adr.md)

Miscellaneous  

5. [Server Deployment Process](./doc/misc/deployment.md)
6. [Git Useful Commands](./doc/misc/git_useful_commands.md)
7. [Local MongoDB Setup Guide](./doc/misc/mongodb_installation_guide.md)
8. [Database Migration Guideline](./doc/misc/database_migration.md)

## Roadmap

20.11.24 Functioning prototype of the website (Milestone 1)  
04.12.24 Application quality control implementations (Milestone 2)  
18.12.24 New features - User account management & Routing algorithm improvements (Milestone 3)  
22.01.25 Observability implementation (Milestone 4)  
05.02.25 Multi-map support with resilient routing (Milestone 5)

## Authors and acknowledgment

John Linthicum  
Marko Kontic  
Minh Hoang Luc  
Shams Kabir  


## Original template
[makeareadme.com](https://www.makeareadme.com/)
