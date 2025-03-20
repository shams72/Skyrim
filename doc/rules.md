# Project Development Rules

## General Guidelines
1. **Definition of Done**: An issue or task is marked as *done* when the merge request concerning that specific feature is approved and merged with the main branch. 
2. **Code Reviews**: All merge requests must be reviewed by at least one other team member.
3. **Code Quality**: Ensure all code is thoroughly tested and linted before committing.
4. **Setup**: Always keep documentation up-to-date, tests running and debugging available with a real debugger.
5. **Planning and Backup**: Ensure application works in production, always have rollback option just in case.

## Version Control
1. **Branching**: Develop individually on your branch, keep the main branch clean and only consisting of merge requests.
2. **Commit Messages**: Follow the commit conventions.
3. **Release**: Each release should be accompanied by a version tag, release notes and relevant documentation. (*Pending: Semantic Release bot for automatic versioning*)

## Merge Requests (MR)
1. **Submit**: Ensure each feature you work on are thoroughly tested and running before submitting a MR.
2. **Roles**: Always assign (person sending the MR) and add reviewers for each MR, make sure approval is mandatory. The reviewer has to approve the MR before merging.
3. **Conflict Resolution**: If there are merge conflicts, reach out the person responsible for the MR/feature. This person should then handle the resolution themselves, or at least give clear instructions on how to resolve conflicts in case they are unavailable.

## Merge Process
1. Green pipeline should be the minimum before handling the merge process. 
2. As a reviewer, it is advised to checkout the source branch locally, run all dedicated tests for that feature and confirm there is no issue.
3. In case of issues, reach out to the author of the MR - report the issue clearly and correctly for them to correct it.
3. Make sure "Squash the commits" option is selected before confirming the MR to keep the main branch clean.
4. See to it that the pipeline also runs correctly in main after the merge process. In case of problems, report at once to the group to identify the source problem and issue a fix.

## Collaboration
1. **Peer Review**: Use the Whatsapp group chat for casual, quick feedback and Q&A on general issues; use the Discord server for issues that should always be ready for access (i.e. without needlessly scrolling through a long chat conversation)
2. **Documentation**: Document the steps you have taken for your work (code comments, additional doc in the misc folder) so teammates can follow effectively when necessary.
3. **Channels**: Use dedicated channels in the Discord server: *Troubleshooting* for noting common problems & fixes, *To-do* for noting quick to-dos informally aside the official Issue Board, *Resources* for saving helpful resources/weblinks that may aid the project.

## Dependencies
1. **Status**: Ensure all dependencies are kept up-to-date automatically.
2. **Usage**: Regularly check the dependency list for each services and remove them if no more needed.

## Security
1. **Sensitive Data**: Do not commit sensitive data to the repository.
2. **Code Execution**: Be aware of and prevent code execution e.g. SQL injection when writing code.
3. **Debugging**: No debug output are allowed in the final product.

## Continuous Integration/Continuous Deployment (CI/CD)
1. **Dependency Proxy**: Ensure the usage of dependency proxy to avoid unnecessary load on the server.
2. **Builds**: Ensure all builds pass before merging code.
3. **Deployments**: Deployments are done in the staging environment, for big version releases the deployment button inside the pipeline is to be used.
4. **Speed**: Ensure build and deploy velocity is reasonable and with minimum delay.

## Ethics
1. **Respect**: Treat all team members with respect and professionalism.
2. **Integrity**: Maintain integrity and honesty in all work.
3. **Responsibility**: Take responsibility for your work and its impact on the project.
4. **Communication**: Communicate extensively to make sure everyone in the team is on the same page.
