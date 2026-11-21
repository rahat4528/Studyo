FROM python:3.11-alpine

# Create non-root unprivileged runner user
RUN adduser -D -u 1000 runner

# Set secure execution workspace
WORKDIR /workspace
RUN chown -R runner:runner /workspace

USER runner

ENTRYPOINT ["python3"]
