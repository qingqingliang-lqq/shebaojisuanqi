import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/types';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未找到文件' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 转换为 JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { error: '文件中没有数据' },
        { status: 400 }
      );
    }

    // 调试：输出原始数据
    console.log('原始数据:', JSON.stringify(jsonData, null, 2));

    // 验证数据格式需要的字段
    const requiredFields = ['city_name', 'year', 'base_min', 'base_max', 'rate'];

    // 定义中英文字段名映射（包括常见拼写错误和带空格的情况）
    const fieldMapping = {
      '城市名称': 'city_name',
      '城市名': 'city_name',
      'city_name': 'city_name',
      'city_namte': 'city_name', // 拼写错误
      'city_namte ': 'city_name', // 拼写错误+空格
      'city_name ': 'city_name', // 带空格
      '年份': 'year',
      'year': 'year',
      'year ': 'year', // 带空格
      '基数下限': 'base_min',
      '社保基数下限': 'base_min',
      'base_min': 'base_min',
      'base_min ': 'base_min', // 带空格
      '基数上限': 'base_max',
      '社保基数上限': 'base_max',
      'base_max': 'base_max',
      'base_max ': 'base_max', // 带空格
      '缴纳比例': 'rate',
      '综合缴纳比例': 'rate',
      'rate': 'rate',
      'rate ': 'rate', // 带空格
      'id': 'id', // 忽略id字段
    };

    // 转换字段名：将中文列名转换为英文，并去除字段名前后的空格
    const transformedData = jsonData.map((row: any) => {
      const newRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        // 去除键名前后的空格
        const trimmedKey = key.trim();
        const mappedKey = fieldMapping[trimmedKey as keyof typeof fieldMapping] || trimmedKey;

        // 只保留需要的字段，忽略 id 字段
        if (mappedKey !== 'id' && requiredFields.includes(mappedKey)) {
          newRow[mappedKey] = value;
        }
      }
      return newRow;
    });

    // 调试：输出转换后的数据
    console.log('转换后数据:', JSON.stringify(transformedData, null, 2));

    // 验证数据格式
    const firstRow = transformedData[0] as any;
    const actualFields = Object.keys(firstRow);

    console.log('需要的字段:', requiredFields);
    console.log('实际的字段:', actualFields);

    for (const field of requiredFields) {
      if (!(field in firstRow)) {
        return NextResponse.json(
          {
            error: `数据格式错误：缺少字段 "${field}"`,
            details: {
              required: requiredFields,
              actual: actualFields,
              firstRow: firstRow,
              originalData: jsonData[0],
              hint: '请确保Excel文件包含以下列名（中文或英文均可）：城市名称/city_name、年份/year、基数下限/base_min、基数上限/base_max、缴纳比例/rate'
            }
          },
          { status: 400 }
        );
      }
    }

    // 清空旧数据
    const { error: deleteError } = await supabase
      .from(TABLES.CITIES)
      .delete()
      .neq('id', 0);

    if (deleteError) {
      return NextResponse.json(
        { error: '清空旧数据失败', details: deleteError.message },
        { status: 500 }
      );
    }

    // 插入新数据
    const { error: insertError } = await supabase
      .from(TABLES.CITIES)
      .insert(transformedData);

    if (insertError) {
      return NextResponse.json(
        { error: '插入数据失败', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功上传 ${transformedData.length} 条城市标准数据`,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: '文件处理失败', details: error.message },
      { status: 500 }
    );
  }
}
