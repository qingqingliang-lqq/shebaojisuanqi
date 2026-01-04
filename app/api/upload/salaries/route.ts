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

    // 定义中英文字段名映射
    const fieldMapping = {
      '员工工号': 'employee_id',
      '工号': 'employee_id',
      'employee_id': 'employee_id',
      '员工姓名': 'employee_name',
      '姓名': 'employee_name',
      'employee_name': 'employee_name',
      '月份': 'month',
      '年月': 'month',
      'month': 'month',
      '工资金额': 'salary_amount',
      '工资': 'salary_amount',
      'salary_amount': 'salary_amount',
    };

    // 转换字段名：将中文列名转换为英文
    const transformedData = jsonData.map((row: any) => {
      const newRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        const mappedKey = fieldMapping[key as keyof typeof fieldMapping] || key;
        newRow[mappedKey] = value;
      }
      return newRow;
    });

    // 验证数据格式
    const requiredFields = ['employee_id', 'employee_name', 'month', 'salary_amount'];
    const firstRow = transformedData[0] as any;
    const actualFields = Object.keys(firstRow);

    for (const field of requiredFields) {
      if (!(field in firstRow)) {
        return NextResponse.json(
          {
            error: `数据格式错误：缺少字段 "${field}"`,
            details: {
              required: requiredFields,
              actual: actualFields,
              firstRow: firstRow,
              hint: '请确保Excel文件包含以下列名（中文或英文均可）：员工工号/employee_id、员工姓名/employee_name、月份/month、工资金额/salary_amount'
            }
          },
          { status: 400 }
        );
      }
    }

    // 清空旧数据
    const { error: deleteError } = await supabase
      .from(TABLES.SALARIES)
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
      .from(TABLES.SALARIES)
      .insert(transformedData);

    if (insertError) {
      return NextResponse.json(
        { error: '插入数据失败', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功上传 ${transformedData.length} 条员工工资数据`,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: '文件处理失败', details: error.message },
      { status: 500 }
    );
  }
}
