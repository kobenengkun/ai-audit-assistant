import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import Navigation from './components/Navigation';

const { Content } = Layout;

// 使用 React.lazy 进行代码分割
const Dashboard = lazy(() => import('./components/Dashboard'));
const AuditPlan = lazy(() => import('./components/AuditPlan'));
const AuditExecution = lazy(() => import('./components/AuditExecution'));
const AuditReport = lazy(() => import('./components/AuditReport'));
const AuditImprovement = lazy(() => import('./components/AuditImprovement'));
const NotFound = lazy(() => import('./components/NotFound'));

// 创建一个加载指示器组件
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation />
        <Layout>
          <Content style={{ padding: '0 50px', marginTop: 64 }}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/audit-plans" element={<AuditPlan />} />
                <Route path="/audit-execution" element={<AuditExecution />} />
                <Route path="/audit-report" element={<AuditReport />} />
                <Route path="/audit-improvement" element={<AuditImprovement />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;