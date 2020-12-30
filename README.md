# Membership Server

The membership server is the source of truth for who has access to what at the makerspace.
Membership statuses will be pulled down from Payment Providers on a daily basis.
If a member has made a payment in the past 30 days, they will be considered an active member.

Maintain Access Control lists for who has access to what.

## Start the app

This project uses docker.
A testing environment can be spun up by running the build script.

```
sh buildandrun.sh
```

### Seed the DB with test data

```
cd test/postgres
sh seedLocal.sh
```

### CONFIG file

This app requires a config file.
The path for the config file is set using the `MEMBER_SERVER_CONFIG_FILE` environment variable.

the `sample.config.json` can be used as a template for this file.

```
export MEMBER_SERVER_CONFIG_FILE="/etc/hackrva/config.json"
```
