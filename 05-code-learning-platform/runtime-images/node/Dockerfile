FROM node:20-alpine

# Create non-root unprivileged runner user
RUN adduser -D -u 1000 runner

# Install TypeScript support
RUN npm install -g typescript ts-node

WORKDIR /workspace
RUN chown -R runner:runner /workspace

USER runner

ENTRYPOINT ["node"]
