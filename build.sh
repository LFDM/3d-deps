yarn cfg build
yarn client build
rm -rf packages/server/client_build
cp -r packages/client/build packages/server/client_build
yarn server build
