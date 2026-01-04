'use client';

import { useState } from 'react';

export default function TestUploadPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testUpload = async () => {
    setLoading(true);
    setResult(null);

    try {
      // 创建测试数据
      const testData = {
        city_name: '佛山',
        year: '2024',
        base_min: 1900,
        base_max: 31851,
        rate: 0.15
      };

      // 转换为 JSON 格式用于 Excel
      const response = await fetch('/api/upload/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
      });
    } catch (error: any) {
      setResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">测试上传功能</h1>

        <button
          onClick={testUpload}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '测试中...' : '测试上传'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-white rounded shadow">
            <h2 className="font-bold mb-2">结果：</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
