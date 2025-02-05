const fs = require('fs-extra');
const path = require('path');

const templatesSrc = path.join(__dirname, '../src/init/templates/harmony');
const templatesDest = path.join(__dirname, '../dist/init/templates/harmony');
async function copyTemplate() {
  try {
    if (await fs.pathExists(templatesDest)) {
      await fs.remove(templatesDest);
    }
    await fs.copy(templatesSrc, templatesDest);
    console.log('Templates folder copied successfully!');
  } catch (err) {
    console.error('Error copying templates folder:', err);
  }
}

copyTemplate();
