docker build \
    -t ghcr.io/syncuprockslive/bandguy-frontend-react:v0.0.3 \
    -t ghcr.io/syncuprockslive/bandguy-frontend-react:latest \
    -f builds/frontend/Dockerfile .

docker build \
    -t ghcr.io/syncuprockslive/bandguy-express-mock:v0.0.2 \
    -t ghcr.io/syncuprockslive/bandguy-express-mock:latest \
    -f builds/mock-backend/Dockerfile .

docker run -it --rm -p 8080:9000 ghcr.io/syncuprockslive/bandguy-frontend-react:latest
docker run -it --rm -p 8081:9000 ghcr.io/syncuprockslive/bandguy-express-mock:latest

export CR_PAT=YOUR_TOKEN
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin

docker push ghcr.io/syncuprockslive/bandguy-frontend-react --all-tags
docker push ghcr.io/syncuprockslive/bandguy-express-mock --all-tags
