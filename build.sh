cd client
yarn build
cd ..
rm -rf server/client_build
cp -r client/build server/client_build