const fs = require('fs').promises;
const path = require('path');

const templatesPath = path.join(__dirname, '../routes/planTemplates.json');

exports.getAllTemplates = async (req, res) => {
  try {
    const data = await fs.readFile(templatesPath, 'utf8');
    const templates = JSON.parse(data);
    res.json(templates);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 如果文件不存在，返回空数组
      res.json([]);
    } else {
      res.status(500).json({ message: "Error retrieving templates", error: error.message });
    }
  }
};

exports.createTemplate = async (req, res) => {
  try {
    let templates = [];
    try {
      const data = await fs.readFile(templatesPath, 'utf8');
      templates = JSON.parse(data);
    } catch (readError) {
      if (readError.code !== 'ENOENT') {
        throw readError;
      }
    }
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