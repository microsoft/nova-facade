# Contributing

## Development setup

This repo uses `yarn` for package management:

```
git clone https://github.com/microsoft/nova-facade.git
yarn
```

## Build (no typechecking, incremental)

This repo uses [`lage`](https://microsoft.github.io/lage) to achieve incremental builds:

```
yarn build
```

## Test

Within your package folder, run this command for unit tests:

```
yarn test
```

## Lint

```
yarn lint
```

## PRs and package publishing

This repo is using beachball for package management. The change files generated
by beachball are included with your PR and used in CI to publish the packages.

# Checking the status of your branch

```
yarn beachball check
```  

# Preparing your branch for PR

```
yarn beachball change
```