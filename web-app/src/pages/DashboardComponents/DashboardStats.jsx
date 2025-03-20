import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const DashboardStats = ({ stats = [] }) => {
  if (!stats || stats.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h4 className="text-2xl font-bold text-blue-900 mt-1">{stat.value}</h4>
              </div>
              {stat.icon && (
                <div className="bg-blue-100 p-3 rounded-full">
                  {stat.icon}
                </div>
              )}
            </div>
            {stat.change && (
              <div className={`text-xs font-medium mt-2 ${
                stat.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
