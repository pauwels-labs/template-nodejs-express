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
echo "Pushing initial v0.0.0 tag pre-rename commit"
git tag v0.0.0
git push --tags
echo "Committing and pushing rename commit"
git add .
git commit -am "fix: renames files via template.sh script"
git push
