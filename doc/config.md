# Project Configurations

## Application and Dependencies
1. Run `npm run install-all` to install all dependencies needed for your local machine.
Run `npm run uninstall-all` to remove all dependencies packages from your local machine (without removing them in the *package.json*).
2. Check for unused dependencies: run `npx depcheck` in your desired working folder. Uninstall unused dependencies using `npm uninstall <package_name>` as needed.
3. In pipeline: the application is started using the same `docker-compose` command, while `npm install` is called in each respective *Dockerfile* to fetch the dependencies for each service.

## Testing

1. Make sure `docker-compose up -d --build` is called beforehand/services are up, else the tests will fail!
2. Go to the root folder of the desired service (backend, frontend, navigation service). If you want to run all test suites, stay in the root directory of the program.
3. Run `npm test` in the terminal and result will be shown directly here.
4. In pipeline: `docker exec _ npm test` will be called for all three services and will pass when all tests are successful.

## Debugging (Visual Studio Code)

1. Use the built-in *Run and Debug* feature - this can be found on the left sidebar (normal *Run* icon with a bug).
2. Choose your desired breakpoint in the specified code file, and open the *JavaScript Debug Terminal* from the drop down menu in the top left. 
3. Try running your program from this terminal, for example `npm run` or `npm test` from each service root folder - you know the debugger is running when the output includes the line *Debugger attached*.
4. The floating ribbon on the upper left corner includes all necessary functions for debugging - use these as needed. Stop the session using the *Stop* command from this ribbon.

## Linting

1. Run the CLI command `npx eslint . --fix` inside the repo root. Replace the "." with the path of the folder/file you want to lint. It is *recommended* to lint your code before pushing to the repo to avoid the lint pipeline from failing!
2. In pipeline: Linter will be installed with the same command, and `npx eslint .` will check for linting errors from the whole codebase.
