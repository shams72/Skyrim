# Commit Conventions

## General Structure

    <type>[optional scope]: <description>

    [optional body]

    [optional footer(s)]


## Structural Elements
1. **fix**: type, indicates patching a bug.
2. **feat**: type, indicates new feature introduction (minor).
3. **BREAKING CHANGE**: footer, or as a suffix **!** after type/scope, indicates a breaking API change (major). Can be part of commits of any type.
4. **Other types**: *build:*, *chore:*, *ci:*, *docs:*, *style:*, *refactor:*, *perf:*, *test:*
5. **Scope**: provided additional contextual information, contained within parenthesis.

## Rules
1. Commits must be prefixed with a type, following with the terminal colon and space. Other parts are optional (see **general structure**).
2. A description must immediately follow the type/scope. 
3. A longer commit body may be provided after the short description and must then begin one blank line after it.
4. One or more footers may be provided one blank line after the body. Each footer must consist of a word token, followed by a *:<space>* separator and then a string value.
5. A footer's token must use *-* in place of whitespace characters with an exception for **BREAKING CHANGE**.


Commit conventions are loosely based on [Convetional Commits](https://www.conventionalcommits.org/en/v1.0.0/).