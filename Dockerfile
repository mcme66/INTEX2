FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY . .
RUN dotnet publish IntexApi.csproj -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Install Python + notebook dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install Python ML libraries
COPY ml-pipelines/requirements.txt ./ml-pipelines/requirements.txt
RUN pip3 install --break-system-packages -r ml-pipelines/requirements.txt

# Copy built app and notebooks
COPY --from=build /app/out .
COPY ml-pipelines/ ./ml-pipelines/

ENTRYPOINT ["dotnet", "IntexApi.dll"]
