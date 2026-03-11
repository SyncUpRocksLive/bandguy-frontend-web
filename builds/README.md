docker build -t ghcr.io/syncuprockslive/bandguy-frontend-react:latest -f builds/frontend/Dockerfile .
docker run -it --rm -p 8080:9000 ghcr.io/syncuprockslive/bandguy-frontend-react:latest

docker build -t ghcr.io/syncuprockslive/bandguy--express-mock:latest -f builds/mock-backend/Dockerfile .
docker run -it --rm -p 8081:9000 ghcr.io/syncuprockslive/bandguy--express-mock:latest
