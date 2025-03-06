import React from 'react';
import { Card, Row, Col } from 'antd';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RatingAnalysisProps {
  reviews: Array<{
    rating: number;
    platform: 'ios' | 'android';
  }>;
}

interface ChartDatum {
  percentage: number;
  rating?: number;
  count?: number;
  platform?: string;
}

export const RatingAnalysis: React.FC<RatingAnalysisProps> = ({ reviews }) => {
  // 计算评分分布
  const calculateRatingDistribution = () => {
    const distribution = Array(5).fill(0);
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    
    return distribution.map((count, index) => ({
      rating: index + 1,
      count,
      percentage: (count / reviews.length * 100).toFixed(1)
    }));
  };

  // 计算平台分布
  const calculatePlatformDistribution = () => {
    const platforms = { ios: 0, android: 0 };
    reviews.forEach(review => {
      platforms[review.platform]++;
    });
    
    return Object.entries(platforms).map(([platform, count]) => ({
      platform: platform === 'ios' ? 'iOS' : 'Android',
      count,
      percentage: (count / reviews.length * 100).toFixed(1)
    }));
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card title="评分分布">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calculateRatingDistribution()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {calculateRatingDistribution().map((entry, index) => (
                  <text
                    key={index}
                    x={index * 70 + 35}
                    y={entry.count > 0 ? 300 - entry.count * 30 - 10 : 290}
                    textAnchor="middle"
                  >
                    {entry.percentage}%
                  </text>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>
      
      <Col span={12}>
        <Card title="平台分布">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={calculatePlatformDistribution()}
                dataKey="count"
                nameKey="platform"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {calculatePlatformDistribution().map((entry, index) => (
                  <Cell key={index} fill={index === 0 ? '#8884d8' : '#82ca9d'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  );
}; 