import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navigation from './components/Navigation';
import AuditManagement from './components/AuditManagement';

const { Content } = Layout;

const App = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation />
        <Layout>
          <Content style={{ padding: '0 50px', marginTop: 64 }}>
            <Routes>
              <Route path="/" element={<Navigate replace to="/audit-management" />} />
              <Route path="/audit-management" element={<AuditManagement />} />
              {/* 其他路由 */}
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;