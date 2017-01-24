FROM debian:stretch-slim

#COPY tegola_linux_amd64 tegola
RUN apt-get update && \
    apt-get install -y curl && \
    curl -L -o /tegola https://github.com/terranodo/tegola/releases/download/v0.3.1/tegola_linux_amd64 && \
    chmod +x /tegola && \
    apt-get purge -y curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

CMD ["./tegola"]
