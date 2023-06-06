OLD_NAME="template-nodejs-express"
SERVICE_DIR=$(git rev-parse --show-toplevel)
NEW_NAME=$(basename "$SERVICE_DIR")
echo "Renaming all instances of \"$OLD_NAME\" to \"$NEW_NAME\""
rm -rf node_modules
rm -rf package-lock.json
grep -rl "$OLD_NAME" . --exclude-dir=.git --exclude=template.sh | xargs sed -i "s/$OLD_NAME/$NEW_NAME/g"
npm install
echo "Rename complete, this script will now delete itself"