FROM debian:buster-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  webhook=2.6.9-1 \
  curl \
  gnupg \
  ca-certificates \
  && curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
  && echo "deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
  postgresql-client-11 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /webhook

COPY webhook /webhook

CMD ["/usr/bin/webhook", "-verbose"]
