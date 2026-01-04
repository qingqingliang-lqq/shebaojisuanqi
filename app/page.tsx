'use client';

import { useState } from 'react';

interface Result {
  id: number;
  employee_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

export default function Home() {
  const [uploadingCity, setUploadingCity] = useState(false);
  const [uploadingSalary, setUploadingSalary] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [hasResults, setHasResults] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCityUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCity(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/cities', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('success', result.message);
        e.target.value = '';
      } else {
        const errorMsg = result.details
          ? `${result.error}\n详细信息：\n需要字段: ${result.details.required.join(', ')}\n实际字段: ${result.details.actual.join(', ')}`
          : result.error;
        showMessage('error', errorMsg);
      }
    } catch (error: any) {
      showMessage('error', '上传失败：' + error.message);
    } finally {
      setUploadingCity(false);
    }
  };

  const handleSalaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSalary(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/salaries', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('success', result.message);
        e.target.value = '';
      } else {
        showMessage('error', result.error || '上传失败');
      }
    } catch (error: any) {
      showMessage('error', '上传失败：' + error.message);
    } finally {
      setUploadingSalary(false);
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('success', result.message);
        // 计算成功后自动加载结果
        fetchResults();
      } else {
        showMessage('error', result.error || '计算失败');
      }
    } catch (error: any) {
      showMessage('error', '计算失败：' + error.message);
    } finally {
      setCalculating(false);
    }
  };

  const fetchResults = async () => {
    setLoadingResults(true);
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      setResults(data.results || []);
      setHasResults(data.results && data.results.length > 0);
    } catch (error: any) {
      console.error('获取结果失败:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            五险一金计算器
          </h1>
          <p className="text-lg text-gray-600">
            上传数据、执行计算、查看结果，一站式完成
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <div className="whitespace-pre-line">{message.text}</div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* 卡片一：城市标准数据上传 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">城市标准</h2>
                <p className="text-sm text-gray-600">上传社保标准</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors">
              <input type="file" id="cityFile" accept=".xlsx,.xls" onChange={handleCityUpload} disabled={uploadingCity} className="hidden" />
              <label htmlFor="cityFile" className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadingCity ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {uploadingCity ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    上传中...
                  </>
                ) : '选择文件'}
              </label>
            </div>
          </div>

          {/* 卡片二：员工工资数据上传 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">员工工资</h2>
                <p className="text-sm text-gray-600">上传工资数据</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-400 transition-colors">
              <input type="file" id="salaryFile" accept=".xlsx,.xls" onChange={handleSalaryUpload} disabled={uploadingSalary} className="hidden" />
              <label htmlFor="salaryFile" className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadingSalary ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
              }`}>
                {uploadingSalary ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    上传中...
                  </>
                ) : '选择文件'}
              </label>
            </div>
          </div>

          {/* 卡片三：执行计算 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">执行计算</h2>
                <p className="text-sm text-gray-600">计算社保公积金</p>
              </div>
            </div>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                calculating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {calculating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  计算中...
                </span>
              ) : '开始计算'}
            </button>
          </div>
        </div>

        {/* 计算结果表格 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">计算结果</h2>
              {!hasResults && !loadingResults && (
                <span className="text-blue-100 text-sm">请先上传数据并执行计算</span>
              )}
              {hasResults && (
                <span className="text-blue-100 text-sm">共 {results.length} 位员工</span>
              )}
            </div>
          </div>

          {loadingResults && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loadingResults && !hasResults && (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无计算结果</h3>
              <p className="text-gray-600">按照上方步骤操作即可查看结果</p>
            </div>
          )}

          {!loadingResults && hasResults && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">序号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">员工姓名</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">年度月平均工资</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">缴费基数</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">公司应缴纳金额</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={result.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.employee_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(result.avg_salary)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(result.contribution_base)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                          {formatCurrency(result.company_fee)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900">合计</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="font-bold text-gray-900">
                        {formatCurrency(results.reduce((sum, r) => sum + r.avg_salary, 0) / results.length)}
                        <span className="text-xs text-gray-600 ml-1">(平均)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(results.reduce((sum, r) => sum + r.contribution_base, 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-700">
                      {formatCurrency(results.reduce((sum, r) => sum + r.company_fee, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
