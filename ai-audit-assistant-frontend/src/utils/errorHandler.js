// src/utils/errorHandler.js
import { message } from 'antd';

export const handleError = (error) => {
  if (error.response) {
    message.error(`服务器错误: ${error.response.status}`);
  } else if (error.request) {
    message.error('网络错误，请检查你的网络连接');
  } else {
    message.error('发生未知错误');
  }
  console.error('Error:', error);
};