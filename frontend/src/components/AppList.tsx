import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Input, Select, Spin, message, Popconfirm, Tabs, Pagination, Typography, Space } from 'antd';
import { PlusOutlined, SyncOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios, { AxiosRequestConfig } from 'axios';

interface App {
  id: number;
  name: string;
  platform: string;
  app_store_id?: string;
  play_store_id?: string;
}

interface Review {
  id: number;
  rating: number;
  content: string;
  author: string;
  platform: 'ios' | 'android';
  created_at: string;
}

interface ChartDatum {
  date: string;
  ios: number | null;
  android: number | null;
}

interface RatingStats {
  date: string;
  platform: string;
  average_rating: number;
}

interface PlatformStats {
  sum: number;
  count: number;
}

type MonthlyStatsType = {
  [key: string]: {
    ios: PlatformStats;
    android: PlatformStats;
  };
};

const { Paragraph } = Typography;
const PAGE_SIZE = 10; // 每页显示的评论数

export const AppList: React.FC = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [refreshing, setRefreshing] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [currentPage, setCurrentPage] = useState<{ ios: number; android: number }>({
    ios: 1,
    android: 1
  });
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authCode, setAuthCode] = useState(localStorage.getItem('authCode') || '');
  const [authAction, setAuthAction] = useState<() => Promise<void>>(() => Promise.resolve());
  const [countries, setCountries] = useState<{[key: string]: string}>({});

  // 加载国家配置
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/config/countries.json');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('加载国家配置失败:', error);
        message.error('加载国家配置失败');
      }
    };
    loadCountries();
  }, []);

  // 获取应用列表
  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await axios.get('/api/apps');
      setApps(response.data);
    } catch (error) {
      message.error('获取应用列表失败');
    }
  };

  // 获取应用评论
  const fetchReviews = async (appId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/apps/${appId}/reviews`);
      setReviews(response.data);
    } catch (error) {
      message.error('获取评论失败');
    } finally {
      setLoading(false);
    }
  };

  // 验证授权码并执行操作
  const executeWithAuth = async (action: () => Promise<void>) => {
    if (!authCode) {
      setAuthAction(() => action);
      setAuthModalVisible(true);
      return;
    }
    try {
      await action();
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('授权码无效');
        setAuthCode('');
        localStorage.removeItem('authCode');
        setAuthAction(() => action);
        setAuthModalVisible(true);
      } else {
        throw error;
      }
    }
  };

  // 设置请求头
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config: AxiosRequestConfig) => {
      const newConfig = { ...config };
      newConfig.headers = newConfig.headers || {};
      if (authCode) {
        newConfig.headers['X-Auth-Code'] = authCode;
      }
      return newConfig;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [authCode]);

  // 添加新应用
  const handleAddApp = async (values: any) => {
    await executeWithAuth(async () => {
      await axios.post('/api/apps', values);
      message.success('添加应用成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchApps();
    });
  };

  // 修改应用
  const handleEditApp = async (values: any) => {
    await executeWithAuth(async () => {
      await axios.put(`/api/apps/${editingApp?.id}`, values);
      message.success('修改应用成功');
      setEditingApp(null);
      form.resetFields();
      fetchApps();
    });
  };

  // 删除应用
  const handleDeleteApp = async (appId: number) => {
    await executeWithAuth(async () => {
      await axios.delete(`/api/apps/${appId}`);
      message.success('删除应用成功');
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
      fetchApps();
    });
  };

  // 计算评分统计数据
  const calculateRatingStats = (): ChartDatum[] => {
    const monthlyStats: MonthlyStatsType = {};
    
    reviews.forEach((review: Review) => {
      const date = new Date(review.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          ios: { sum: 0, count: 0 },
          android: { sum: 0, count: 0 }
        };
      }
      
      monthlyStats[monthKey][review.platform].sum += review.rating;
      monthlyStats[monthKey][review.platform].count += 1;
    });
    
    // 转换为图表所需的数据格式
    return Object.entries(monthlyStats)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, stats]) => {
        const iosRating = stats.ios.count > 0 ? stats.ios.sum / stats.ios.count : null;
        const androidRating = stats.android.count > 0 ? stats.android.sum / stats.android.count : null;
        
        return {
          date,
          ios: iosRating,
          android: androidRating
        };
      });
  };

  // 手动刷新评分
  const handleRefreshReviews = async (appId: number, platform: 'ios' | 'android') => {
    setRefreshing(true);
    try {
      await axios.post(`/api/apps/${appId}/refresh`, { platform });
      message.success(`${platform === 'ios' ? 'App Store' : 'Play Store'} 评分更新成功`);
      // 重新获取评论
      await fetchReviews(appId);
    } catch (error) {
      message.error(`${platform === 'ios' ? 'App Store' : 'Play Store'} 评分更新失败`);
    } finally {
      setRefreshing(false);
    }
  };

  // 刷新最新评论
  const handleRefreshLatestReviews = async (appId: number) => {
    setRefreshing(true);
    try {
      await axios.post(`/api/apps/${appId}/refresh/latest`, { limit: 100 });
      message.success('最新评论更新成功');
      // 重新获取评论
      await fetchReviews(appId);
    } catch (error) {
      message.error('最新评论更新失败');
    } finally {
      setRefreshing(false);
    }
  };

  // 导出评论
  const handleExportReviews = async (appId: number) => {
    try {
      message.loading('正在准备导出文件...', 1);
      // 使用 window.open 直接下载文件
      window.open(`/api/apps/${appId}/export`, '_blank');
      message.success('评论导出成功');
    } catch (error) {
      message.error('评论导出失败');
    }
  };

  // 分离 iOS 和 Android 评论
  const iosReviews = reviews.filter(review => review.platform === 'ios');
  const androidReviews = reviews.filter(review => review.platform === 'android');

  // 计算当前均分
  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  const iosAverageRating = calculateAverageRating(iosReviews);
  const androidAverageRating = calculateAverageRating(androidReviews);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col>
          <h2>应用列表</h2>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            添加应用
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        {apps.map(app => (
          <Col key={app.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={app.name}
              extra={
                <div onClick={e => e.stopPropagation()}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingApp(app);
                      form.setFieldsValue(app);
                    }}
                  />
                  <Popconfirm
                    title="确定要删除这个应用吗？"
                    onConfirm={() => handleDeleteApp(app.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              }
              hoverable
              onClick={() => {
                setSelectedApp(app);
                fetchReviews(app.id);
              }}
            >
              <p>平台: {app.platform}</p>
              {app.app_store_id && <p>App Store ID: {app.app_store_id}</p>}
              {app.play_store_id && <p>Play Store ID: {app.play_store_id}</p>}
            </Card>
          </Col>
        ))}
      </Row>

      {selectedApp && (
        <Card style={{ marginTop: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h3>{selectedApp.name} 评分趋势</h3>
            </Col>
            <Col>
              <Space size="middle">
                {selectedApp.platform !== 'android' && (
                  <Button
                    type="primary"
                    icon={<SyncOutlined spin={refreshing} />}
                    onClick={() => handleRefreshReviews(selectedApp.id, 'ios')}
                    loading={refreshing}
                  >
                    更新 App Store
                  </Button>
                )}
                {selectedApp.platform !== 'ios' && (
                  <Button
                    type="primary"
                    icon={<SyncOutlined spin={refreshing} />}
                    onClick={() => handleRefreshReviews(selectedApp.id, 'android')}
                    loading={refreshing}
                  >
                    更新 Play Store
                  </Button>
                )}
                <Button
                  type="default"
                  icon={<SyncOutlined spin={refreshing} />}
                  onClick={() => handleRefreshLatestReviews(selectedApp.id)}
                  loading={refreshing}
                >
                  刷新最新评论
                </Button>
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportReviews(selectedApp.id)}
                >
                  导出评论
                </Button>
              </Space>
            </Col>
          </Row>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin />
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={calculateRatingStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    formatter={(value: number) => value ? value.toFixed(2) : '暂无数据'} 
                    labelFormatter={(label) => `${label} 月度均分`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ios" 
                    name="iOS" 
                    stroke="#8884d8" 
                    connectNulls 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="android" 
                    name="Android" 
                    stroke="#82ca9d" 
                    connectNulls 
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div style={{ marginTop: '24px' }}>
                <h3>最新评论</h3>
                <Tabs defaultActiveKey="ios">
                  <Tabs.TabPane 
                    tab={`iOS 评论 (${iosAverageRating}⭐)`}
                    key="ios"
                  >
                    <Row gutter={[16, 16]}>
                      {iosReviews
                        .slice(
                          (currentPage.ios - 1) * PAGE_SIZE,
                          currentPage.ios * PAGE_SIZE
                        )
                        .map(review => (
                          <Col key={review.id} span={24}>
                            <Card size="small">
                              <p>评分: {'⭐'.repeat(review.rating)}</p>
                              <p>内容: 
                                <Paragraph
                                  ellipsis={{ 
                                    rows: 2,
                                    expandable: true,
                                    symbol: '展开'
                                  }}
                                >
                                  {review.content}
                                </Paragraph>
                              </p>
                              <p>作者: {review.author}</p>
                              <p>时间: {new Date(review.created_at).toLocaleString()}</p>
                            </Card>
                          </Col>
                        ))}
                      {iosReviews.length === 0 && (
                        <Col span={24}>
                          <Card size="small">
                            <p>暂无 iOS 评论</p>
                          </Card>
                        </Col>
                      )}
                    </Row>
                    {iosReviews.length > 0 && (
                      <div style={{ textAlign: 'right', marginTop: '16px' }}>
                        <Pagination
                          current={currentPage.ios}
                          onChange={(page) => setCurrentPage(prev => ({ ...prev, ios: page }))}
                          total={iosReviews.length}
                          pageSize={PAGE_SIZE}
                          showTotal={(total) => `共 ${total} 条评论`}
                        />
                      </div>
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane 
                    tab={`Android 评论 (${androidAverageRating}⭐)`}
                    key="android"
                  >
                    <Row gutter={[16, 16]}>
                      {androidReviews
                        .slice(
                          (currentPage.android - 1) * PAGE_SIZE,
                          currentPage.android * PAGE_SIZE
                        )
                        .map(review => (
                          <Col key={review.id} span={24}>
                            <Card size="small">
                              <p>评分: {'⭐'.repeat(review.rating)}</p>
                              <p>内容: 
                                <Paragraph
                                  ellipsis={{ 
                                    rows: 2,
                                    expandable: true,
                                    symbol: '展开'
                                  }}
                                >
                                  {review.content}
                                </Paragraph>
                              </p>
                              <p>作者: {review.author}</p>
                              <p>时间: {new Date(review.created_at).toLocaleString()}</p>
                            </Card>
                          </Col>
                        ))}
                      {androidReviews.length === 0 && (
                        <Col span={24}>
                          <Card size="small">
                            <p>暂无 Android 评论</p>
                          </Card>
                        </Col>
                      )}
                    </Row>
                    {androidReviews.length > 0 && (
                      <div style={{ textAlign: 'right', marginTop: '16px' }}>
                        <Pagination
                          current={currentPage.android}
                          onChange={(page) => setCurrentPage(prev => ({ ...prev, android: page }))}
                          total={androidReviews.length}
                          pageSize={PAGE_SIZE}
                          showTotal={(total) => `共 ${total} 条评论`}
                        />
                      </div>
                    )}
                  </Tabs.TabPane>
                </Tabs>
              </div>
            </>
          )}
        </Card>
      )}

      <Modal
        title={editingApp ? "修改应用" : "添加应用"}
        visible={isModalVisible || !!editingApp}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingApp(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={editingApp ? handleEditApp : handleAddApp}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="应用名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="platform"
            label="平台"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="ios">iOS</Select.Option>
              <Select.Option value="android">Android</Select.Option>
              <Select.Option value="both">双平台</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="app_store_country"
            label="App Store 地区"
            initialValue="cn"
          >
            <Select>
              {Object.entries(countries).map(([code, name]) => (
                <Select.Option key={code} value={code}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="play_store_country"
            label="Play Store 地区"
            initialValue="cn"
          >
            <Select>
              {Object.entries(countries).map(([code, name]) => (
                <Select.Option key={code} value={code}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="app_store_id"
            label="App Store ID"
            rules={[
              {
                pattern: /^\d+$/,
                message: 'App Store ID 必须是数字'
              }
            ]}
          >
            <Input placeholder="例如：414478124" />
          </Form.Item>
          
          <Form.Item
            name="play_store_id"
            label="Play Store ID"
          >
            <Input />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="请输入授权码"
        visible={authModalVisible}
        onOk={async () => {
          try {
            if (!authCode) {
              message.error('授权码不能为空');
              return;
            }
            await authAction();
            localStorage.setItem('authCode', authCode);
            setAuthModalVisible(false);
          } catch (error) {
            message.error('操作失败');
            localStorage.removeItem('authCode');
          }
        }}
        onCancel={() => {
          setAuthModalVisible(false);
          setAuthAction(() => Promise.resolve());
          setAuthCode('');
        }}
      >
        <Input.Password
          value={authCode}
          onChange={e => setAuthCode(e.target.value)}
          placeholder="请输入授权码"
        />
      </Modal>
    </div>
  );
}; 