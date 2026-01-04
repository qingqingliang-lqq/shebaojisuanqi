import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/types';

export async function POST() {
  try {
    // 1. 读取所有工资数据
    const { data: salaries, error: salariesError } = await supabase
      .from(TABLES.SALARIES)
      .select('*');

    if (salariesError) {
      return NextResponse.json(
        { error: '读取工资数据失败', details: salariesError.message },
        { status: 500 }
      );
    }

    if (!salaries || salaries.length === 0) {
      return NextResponse.json(
        { error: '没有找到工资数据，请先上传员工工资数据' },
        { status: 400 }
      );
    }

    // 2. 按员工分组计算年度月平均工资
    const employeeSalaries = new Map<string, number[]>();

    salaries.forEach((salary: any) => {
      const name = salary.employee_name;
      const amount = salary.salary_amount;

      if (!employeeSalaries.has(name)) {
        employeeSalaries.set(name, []);
      }
      employeeSalaries.get(name)!.push(amount);
    });

    // 计算每个员工的平均工资
    const employeeAvgSalaries = new Map<string, number>();
    employeeSalaries.forEach((amounts, name) => {
      const avg = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      employeeAvgSalaries.set(name, avg);
    });

    // 3. 从 cities 表获取佛山的标准（从工资数据的月份中提取年份）
    const firstSalary = salaries[0] as any;
    const year = firstSalary.month.substring(0, 4);

    const { data: cities, error: citiesError } = await supabase
      .from(TABLES.CITIES)
      .select('*')
      .eq('city_name', '佛山')
      .eq('year', year)
      .single();

    if (citiesError || !cities) {
      return NextResponse.json(
        { error: '未找到佛山的社保标准数据，请先上传城市标准数据', details: citiesError?.message },
        { status: 400 }
      );
    }

    const { base_min, base_max, rate } = cities;

    // 4 & 5. 计算缴费基数和公司缴纳金额
    const results = Array.from(employeeAvgSalaries.entries()).map(([name, avgSalary]) => {
      // 确定缴费基数
      let contributionBase: number;
      if (avgSalary < base_min) {
        contributionBase = base_min;
      } else if (avgSalary > base_max) {
        contributionBase = base_max;
      } else {
        contributionBase = avgSalary;
      }

      // 计算公司缴纳金额
      const companyFee = contributionBase * rate;

      return {
        employee_name: name,
        avg_salary: Math.round(avgSalary * 100) / 100, // 保留两位小数
        contribution_base: Math.round(contributionBase * 100) / 100,
        company_fee: Math.round(companyFee * 100) / 100,
      };
    });

    // 6. 清空 results 表并插入新数据
    const { error: deleteError } = await supabase
      .from(TABLES.RESULTS)
      .delete()
      .neq('id', 0); // 删除所有记录

    if (deleteError) {
      return NextResponse.json(
        { error: '清空旧数据失败', details: deleteError.message },
        { status: 500 }
      );
    }

    const { error: insertError } = await supabase
      .from(TABLES.RESULTS)
      .insert(results);

    if (insertError) {
      return NextResponse.json(
        { error: '插入计算结果失败', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功计算并存储了 ${results.length} 位员工的社保数据`,
      data: results,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: '计算过程中发生错误', details: error.message },
      { status: 500 }
    );
  }
}
