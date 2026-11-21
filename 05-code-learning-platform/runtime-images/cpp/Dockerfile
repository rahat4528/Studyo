FROM alpine:3.19

RUN apk add --no-cache g++ make musl-dev

# Create non-root unprivileged runner user
RUN adduser -D -u 1000 runner

WORKDIR /workspace
RUN chown -R runner:runner /workspace

USER runner

ENTRYPOINT ["g++"]
