FROM debian:sid-20190506-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  webhook=2.6.9-1 \
  curl=7.64.0-3 \
  gnupg=2.2.13-2 \
  ca-certificates \
  && curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
  && echo "deb http://apt.postgresql.org/pub/repos/apt/ sid-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
  postgresql-client-11 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /webhook

COPY webhook /webhook

CMD ["/usr/bin/webhook", "-verbose"]
