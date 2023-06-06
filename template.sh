OLD_NAME="template-nodejs-express"
SERVICE_DIR=$(git rev-parse --show-toplevel)
NEW_NAME=$(basename "$SERVICE_DIR")
echo "Renaming all instances of \"$OLD_NAME\" to \"$NEW_NAME\""
rm -rf node_modules
rm -rf package-lock.json
grep -rl "$OLD_NAME" . --exclude-dir=.git --exclude=template.sh | xargs sed -i "s/$OLD_NAME/$NEW_NAME/g"
npm install
echo "Rename complete, this script will now delete itself"
rm -rf template.sh
echo "Committing and pushing changes"
git add .
git commit -am "fix: renames files via template.sh script"
git push
git tag v0.0.1
git push --tags
