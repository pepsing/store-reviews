import React from 'react';
import { Layout } from 'antd';
import { AppList } from './components/AppList';
import './App.less';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <h1>应用评分追踪系统</h1>
      </Header>
      <Content>
        <AppList />
      </Content>
    </Layout>
  );
};

export default App; 