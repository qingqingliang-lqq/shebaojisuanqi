'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [uploadingCity, setUploadingCity] = useState(false);
  const [uploadingSalary, setUploadingSalary] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      } else {
        showMessage('error', result.error || '计算失败');
      }
    } catch (error: any) {
      showMessage('error', '计算失败：' + error.message);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回首页
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            数据上传与计算
          </h1>
          <p className="text-lg text-gray-600">
            上传城市标准和员工工资数据，执行五险一金计算
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 上传区域 */}
        <div className="space-y-6">
          {/* 城市标准数据上传 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">城市标准数据</h2>
                <p className="text-gray-600">上传包含城市社保标准的 Excel 文件</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="cityFile"
                accept=".xlsx,.xls"
                onChange={handleCityUpload}
                disabled={uploadingCity}
                className="hidden"
              />
              <label
                htmlFor="cityFile"
                className={`cursor-pointer inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  uploadingCity
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploadingCity ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    上传中...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    选择文件
                  </>
                )}
              </label>
              <p className="mt-4 text-sm text-gray-500">
                支持 .xlsx 或 .xls 格式，包含字段：city_name, year, base_min, base_max, rate
              </p>
            </div>
          </div>

          {/* 员工工资数据上传 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">员工工资数据</h2>
                <p className="text-gray-600">上传包含员工工资信息的 Excel 文件</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                id="salaryFile"
                accept=".xlsx,.xls"
                onChange={handleSalaryUpload}
                disabled={uploadingSalary}
                className="hidden"
              />
              <label
                htmlFor="salaryFile"
                className={`cursor-pointer inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  uploadingSalary
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {uploadingSalary ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    上传中...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    选择文件
                  </>
                )}
              </label>
              <p className="mt-4 text-sm text-gray-500">
                支持 .xlsx 或 .xls 格式，包含字段：employee_id, employee_name, month, salary_amount
              </p>
            </div>
          </div>

          {/* 执行计算按钮 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">执行计算</h2>
                <p className="text-gray-600">基于上传的数据计算五险一金</p>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={calculating}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                calculating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {calculating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  计算中...
                </span>
              ) : (
                '执行计算并存储结果'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
