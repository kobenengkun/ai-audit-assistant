const fs = require('fs').promises;
const path = require('path');

const templatesPath = path.join(__dirname, '../routes/planTemplates.json');

exports.getAllTemplates = async (req, res) => {
  try {
    // 临时返回一个空数组，以确保路由工作正常
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving templates", error: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const data = await fs.readFile(templatesPath, 'utf8');
    const templates = JSON.parse(data);
    const newTemplate = {
      id: Date.now().toString(),
      ...req.body
    };
    templates.push(newTemplate);
    await fs.writeFile(templatesPath, JSON.stringify(templates, null, 2));
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ message: "Error creating template", error: error.message });
  }
};

// 可以添加更多的控制器方法，如更新、删除模板等