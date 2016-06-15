FROM begriffs/postgrest:v0.3.2.0

RUN apt-get update && \
    apt-get install -y postgresql-client && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY docker-entrypoint.sh /entrypoint.sh

CMD ["./entrypoint.sh"]
